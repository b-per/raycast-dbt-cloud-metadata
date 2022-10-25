import { Action, ActionPanel, getPreferenceValues, Icon, List } from "@raycast/api";
import { fetchCloudApiData, fetchMetadataApiData } from "../utils/fetchApis";
import { useEffect, useState } from "react";
import {
  dbtEnv,
  dbtGraphQLModelShort,
  dbtJobsAnswer,
  dbtManifest,
  dbtManifestModel,
  dbtModelShort,
  dbtRunsAnswer,
} from "../types";
import { useCachedState } from "@raycast/utils";
import { ModelDetails } from "./modelDetails";

const accountId = getPreferenceValues().dbtCloudAccountID;
// const projectId = getPreferenceValues().dbtCloudProjectID;

export function Models(props: { env: dbtEnv, projectID: number }) {
  const env = props.env;
  const projectId = props.projectID;
  const [listModels, setListModels] = useCachedState<Array<dbtModelShort>>(`models-for-proj-${projectId}-for-env-${env.id}`, []);
  // const [listModels, setListModels] = useState<Array<dbtModelShort>>([]);
  const [jobIdNameMapping, setJobIdNameMapping] = useCachedState<Record<string, string>>(
    `list-jobid-name-for-proj-${projectId}`,
    {},
    { cacheNamespace: String(env.id) }
  );
  const [selectedPackage, setSelectedPackage] = useState<string>("All");

  async function fetchModels() {
    // // BPER V1 with metadata
    const url_api = `https://cloud.getdbt.com/api/v2/accounts/${accountId}/jobs/?project_id=${encodeURIComponent(
      projectId
    )}`;
    const results_json: dbtJobsAnswer = (await fetchCloudApiData(url_api)) as dbtJobsAnswer;

    // We loop through the list and create a dict with id as the key and name as the value
    setJobIdNameMapping(Object.assign({}, ...results_json.data.map((x) => ({ [x.id]: x.name }))));


    const urlAPIRuns =
      `https://cloud.getdbt.com/api/v4/accounts/${accountId}/runs?` + encodeURI(`project=${projectId}`);
    const resultsAPIRuns = (await fetchCloudApiData(urlAPIRuns)) as dbtRunsAnswer;

    // We get the last job that has finished (which means it will have artefacts)
    const runId = resultsAPIRuns.data.filter((x) => x.finished_at !== null)[0].id;

    const urlAPIManifest = `https://cloud.getdbt.com/api/v2/accounts/${accountId}/runs/${runId}/artifacts/manifest.json`;

    const resultAPIManifest = (await fetchCloudApiData(urlAPIManifest)) as dbtManifest;

    const ListModelManifest = Object.entries(resultAPIManifest.nodes) as Array<[string, dbtManifestModel]>;
    console.log(ListModelManifest[0]);
    const calcListModels = ListModelManifest.filter(([k, v]) => v.resource_type == "model").map(([k, v]) => ({
      uniqueId: v.unique_id,
      name: v.name,
      materializedType: v.config.materialized,
      packageName: v.package_name,
      path: v.original_file_path,
      root_path: v.root_path,
    }));

    setListModels(calcListModels);
  }

  useEffect(() => {
    fetchModels();
  }, [env]);

  return (
    // Put into its own component
    <List
      navigationTitle="Select a Model"
      searchBarPlaceholder="Search your model"
      isLoading={listModels.length == 0}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Package"
          storeValue={true}
          onChange={(newValue) => {
            setSelectedPackage(newValue);
          }}
        >
          <List.Dropdown.Section title="Package">
            {["All", ...new Set(listModels?.map((item) => item.packageName))].map((e) => (
              <List.Dropdown.Item key={e} title={e} value={e === "All" ? "" : e} />
            ))}
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      {listModels
        .filter((model) => model.packageName.includes(selectedPackage))
        ?.map((item) => (
          <List.Item
            key={item.uniqueId}
            title={item.name}
            subtitle={`${item.materializedType}`}
            accessories={[{ text: item.packageName, icon: Icon.Hammer }]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Show Details"
                  target={
                    <ModelDetails env={env} model={item} jobIdNameMapping={jobIdNameMapping} listModels={listModels} projectId={projectId}/>
                  }
                />
              </ActionPanel>
            }
          />
        ))}
    </List>
  );
}
