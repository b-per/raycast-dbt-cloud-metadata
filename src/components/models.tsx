import { Action, ActionPanel, getPreferenceValues, Icon, List } from "@raycast/api";
import { fetchCloudApiData, fetchMetadataApiData } from "../utils/fetchApis";
import { useEffect, useState } from "react";
import { dbtGraphQLModelShort, dbtJobsAnswer, dbtModelShort } from "../types";
import { useCachedState } from "@raycast/utils";
import { ModelDetails } from "./modelDetails";

const accountId = getPreferenceValues().dbtCloudAccountID;
const projectId = getPreferenceValues().dbtCloudProjectID;


export function Models(props: { envId: string }) {
    const envId = props.envId;
    const [listModels, setListModels] = useCachedState<Array<dbtModelShort>>("list-models", [], {
      cacheNamespace: envId,
    });
    const [jobIdNameMapping, setJobIdNameMapping] = useCachedState<Record<string, string>>(
      "list-jobid-name",
      {},
      { cacheNamespace: envId }
    );
    const [selectedPackage, setSelectedPackage] = useState<string>("All");
  
    async function fetchModels() {
  
      const url_api = `https://cloud.getdbt.com/api/v2/accounts/${accountId}/jobs/?project_id=${encodeURIComponent(projectId)}`
      const results_json: dbtJobsAnswer = await fetchCloudApiData(url_api) as dbtJobsAnswer;
  
      // We loop through the list and crate a dict with id as the key and name as the value
      setJobIdNameMapping(Object.assign({}, ...results_json.data.map((x) => ({ [x.id]: x.name }))));
  
      const job_ids = results_json.data.map((env) => env.id);
  
      // TODO: Check if we need to loop through jobs?
      const graphql_query = `{
        models(
            jobId: ${job_ids[0]},
        ){
            uniqueId,
            name,
            materializedType,
            packageName
            }
        }`
      const resultGQLJSON = (await fetchMetadataApiData(graphql_query)) as dbtGraphQLModelShort;
  
      setListModels(resultGQLJSON.data.models);
    }
  
    useEffect(() => {
      fetchModels();
    }, [envId]);
  
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
                    target={<ModelDetails envId={envId} uniqueId={item.uniqueId} jobIdNameMapping={jobIdNameMapping} />}
                  />
                </ActionPanel>
              }
            />
          ))}
      </List>
    );
  }
