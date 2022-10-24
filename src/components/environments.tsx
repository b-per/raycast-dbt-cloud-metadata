import { Action, ActionPanel, Detail, getPreferenceValues, Icon, List } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { useEffect, useState } from "react";
import { dbtEnv, dbtEnvAnswer, dbtProjectAnswer, dbtModelShort } from "../types";
import { fetchCloudApiData } from "../utils/fetchApis";
import { Models } from "./models";

const accountId = getPreferenceValues().dbtCloudAccountID;
// const projectId = getPreferenceValues().dbtCloudProjectID;

export function Environments(props: {projectId: number}) {
    const projectId = props.projectId;
    const [listEnvs, setListEnvs] = useCachedState<Array<dbtEnv>>(`envs-for-project-${projectId.toString()}`, []);
    const [gitBaseURL, setGitBaseURL] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
  
    async function fetchEnvironments() {
      const url_api = `https://cloud.getdbt.com/api/v3/accounts/${accountId}/projects/${projectId}/environments/`;
      const results_json: dbtEnvAnswer = (await fetchCloudApiData(url_api)) as dbtEnvAnswer;
      setListEnvs(results_json === undefined ? [] : results_json?.data.filter((e: dbtEnv) => e.type == "deployment"));
      return results_json;
    }
  
    // TODO: Get the correct types
    async function fetchGitUrl() {
      const url_api = `https://cloud.getdbt.com/api/v3/accounts/${accountId}/projects/${projectId}/`;
      const results_json: dbtProjectAnswer = (await fetchCloudApiData(url_api)) as dbtProjectAnswer;
  
      // console.log(JSON.stringify(results_json.data.repository, null, 2));
      // const results_json_json = JSON.stringify(results_json, null);
  
  
      // TODO BPER: can I remove the git data from here?
      console.log(`RESULTS: ${results_json}`)
      if (results_json !== undefined){
  
      const URL = results_json?.data.repository.remote_url.replace("git:", "https:").replace(".git", "/");
      const subfolder =
        results_json.data.dbt_project_subdirectory === null ? "" : `/${results_json.data.dbt_project_subdirectory}`;
  
      // console.log(URL + subfolder);
      setGitBaseURL(URL + subfolder);}
  
    }
  
    useEffect(() => {
      fetchEnvironments();
      fetchGitUrl();
      setIsLoading(false);
    }, []);
  
    return (
      <List
        navigationTitle="Select Environment"
        searchBarPlaceholder="Search your environment"
        // isLoading={listEnvs.length == 0}
        isLoading={isLoading}
      >
        {listEnvs.map((item) => (
          <List.Item
            key={item.id}
            title={item.name}
            actions={
              <ActionPanel>
                <Action.Push title="Show Details" target={<Models env={item} projectID={projectId} />} />
              </ActionPanel>
            }
          />
        ))}
      </List>
    );
  }
  
  // To get the list of models, we get the list of jobs and search for the models
  