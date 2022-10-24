import { ActionPanel, List, Action, getPreferenceValues } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

import { fetchCloudApiData, fetchMetadataApiData } from "./utils/fetchApis";

import { useEffect, useState } from "react";
import fetch from "node-fetch";
// import tablemark from "tablemark"

const accountId = getPreferenceValues().dbtCloudAccountID;

import { dbtEnvAnswer, dbtEnv, dbtProjectAnswer } from "./types";
import { Models } from "./components/models";
import { Environments } from "./components/environments";


export default function Command() {
  const [listProjects, setListProjects] = useCachedState<Array<any>>("list-projects", []);
  // const [isLoading, setIsLoading] = useState<boolean>(true);

  async function fetchProjects() {
    // const url_api = `https://cloud.getdbt.com/api/v3/accounts/${accountId}/projects/${projectId}/environments/`;
    const url_api = `https://cloud.getdbt.com/api/v2/accounts/${accountId}/projects/`;
    const results_json: dbtEnvAnswer = (await fetchCloudApiData(url_api)) as dbtEnvAnswer;
    console.log(results_json);
    // setListEnvs(results_json === undefined ? [] : results_json?.data.filter((e: dbtEnv) => e.type == "deployment"));
    setListProjects(results_json === undefined ? [] : results_json?.data.filter((e: dbtEnv) => e.state == 1));
    return results_json;
  }


  useEffect(() => {
    fetchProjects();
    // setIsLoading(false);
  }, []);

  return (
    <List
      navigationTitle="Select Project"
      searchBarPlaceholder="Search your project"
      // isLoading={listEnvs.length == 0}
      // isLoading={isLoading}
    >
      {listProjects.map((item) => (
        <List.Item
          key={item.id}
          title={item.name}
          subtitle={item.id.toString()}
          actions={
            <ActionPanel>
              <Action.Push title="Show Details" target={<Environments projectId={item.id} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

// To get the list of models, we get the list of jobs and search for the models
