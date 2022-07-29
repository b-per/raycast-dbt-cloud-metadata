import { ActionPanel, List, Action, getPreferenceValues } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

import { fetchCloudApiData, fetchMetadataApiData } from "./utils/fetchApis";

import { useEffect, useState } from "react";
import fetch from "node-fetch";
// import tablemark from "tablemark"

const accountId = getPreferenceValues().dbtCloudAccountID;
const projectId = getPreferenceValues().dbtCloudProjectID;

import { dbtEnvAnswer, dbtEnv, dbtProjectAnswer } from "./types";
import { Models } from "./components/models";

export default function Command() {
  const [listEnvs, setListEnvs] = useCachedState<Array<dbtEnv>>("list-envs", []);
  const [gitBaseURL, setGitBaseURL] = useState<string>("");

  async function fetchEnvironments() {
    const url_api = `https://cloud.getdbt.com/api/v3/accounts/${accountId}/projects/${projectId}/environments/`;
    const results_json: dbtEnvAnswer = (await fetchCloudApiData(url_api)) as dbtEnvAnswer;
    setListEnvs(results_json.data.filter((e: dbtEnv) => e.type == "deployment"));
    return results_json;
  }

  // TODO: Get the correct types
  async function fetchGitUrl() {
    const url_api = `https://cloud.getdbt.com/api/v3/accounts/${accountId}/projects/${projectId}/`;
    const results_json: dbtProjectAnswer = (await fetchCloudApiData(url_api)) as dbtProjectAnswer;

    // console.log(JSON.stringify(results_json.data.repository, null, 2));
    const results_json_json = JSON.stringify(results_json, null);

    const URL = results_json.data.repository.remote_url.replace("git:", "https:").replace(".git", "/");
    const subfolder =
      results_json.data.dbt_project_subdirectory === null ? "" : `/${results_json.data.dbt_project_subdirectory}`;

    // console.log(URL + subfolder);
    setGitBaseURL(URL + subfolder);
    // return results_json;
  }

  useEffect(() => {
    fetchEnvironments();
    fetchGitUrl();
  }, []);

  return (
    <List
      navigationTitle="Select Environment"
      searchBarPlaceholder="Search your environment"
      isLoading={listEnvs.length == 0}
    >
      {listEnvs.map((item) => (
        <List.Item
          key={item.id}
          title={item.name}
          actions={
            <ActionPanel>
              <Action.Push title="Show Details" target={<Models env={item} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

// To get the list of models, we get the list of jobs and search for the models
