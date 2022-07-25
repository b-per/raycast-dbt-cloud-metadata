import { ActionPanel, Detail, List, Action, Icon, getPreferenceValues, environment } from "@raycast/api";

import { useEffect, useState } from "react";
import fetch from "node-fetch";
// import tablemark from "tablemark"

import {
  dbtEnvWithName,
  dbtEnvAnswer,
  dbtEnv,
  dbtJobsAnswer,
  dbtGraphQLModelShort,
  dbtModelShort,
  dbtGraphQLModelByEnv,
  dbtModelByEnv,
} from "./types";

export default function Command() {
  const [listEnvs, setListEnvs] = useState<Array<dbtEnvWithName>>([]);
  const [gitBaseURL, setGitBaseURL] = useState<string>('');

  async function fetch_environments() {
    const apiKey = getPreferenceValues().dbtCloudAdminAPIKey;
    const accountId = getPreferenceValues().dbtCloudAccountID;
    const projectId = getPreferenceValues().dbtCloudProjectID;
    const result = await fetch(
      `https://cloud.getdbt.com/api/v3/accounts/${accountId}/projects/${projectId}/environments/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${apiKey}`,
        },
      }
    );
    const results_json: dbtEnvAnswer = (await result.json()) as dbtEnvAnswer;
    // console.log(results_json);
    setListEnvs(
      results_json.data.filter((e: dbtEnv) => e.type == "deployment").map((env) => ({ name: env.name, id: env.id }))
    );
    return results_json;
  }

  // TODO: Get the correct types
  async function fetch_git_url() {
    const apiKey = getPreferenceValues().dbtCloudAdminAPIKey;
    const accountId = getPreferenceValues().dbtCloudAccountID;
    const projectId = getPreferenceValues().dbtCloudProjectID;
    const result = await fetch(
      `https://cloud.getdbt.com/api/v3/accounts/${accountId}/projects/${projectId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${apiKey}`,
        },
      }
    );
    const results_json = (await result.json());
    const URL = results_json.data.repository.remote_url.replace('git:', 'https:').replace('.git','/');
    const subfolder = results_json.data.dbt_project_subdirectory === null ? '' : `/${results_json.data.dbt_project_subdirectory}`;
    // console.log(results_json.data.dbt_project_subdirectory);
    console.log(URL + subfolder);
    setGitBaseURL(URL + subfolder);
    // return results_json;
  }

  useEffect(() => {
    fetch_environments();
    fetch_git_url()
  },[]);

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
              <Action.Push title="Show Details" target={<Models envId={`${item.id}`} />} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

// To get the list of models, we get the list of jobs and search for the models
export function Models(props: { envId: string }) {
  const envId = props.envId;
  const [listModels, setListModels] = useState<Array<dbtModelShort>>([]);
  const [jobIdNameMapping, setJobIdNameMapping] = useState<Record<string, string>>({});

  async function fetch_models() {
    const apiKey = getPreferenceValues().dbtCloudAdminAPIKey;
    const accountId = getPreferenceValues().dbtCloudAccountID;
    const projectId = getPreferenceValues().dbtCloudProjectID;
    const listJobsRequest = await fetch(
      `https://cloud.getdbt.com/api/v2/accounts/${accountId}/jobs/?project_id=${encodeURIComponent(projectId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${apiKey}`,
        },
      }
    );
    const results_json = (await listJobsRequest.json()) as dbtJobsAnswer;
    // console.log(results_json);

    // We loop through the list and crate a dict with id as the key and name as the value
    setJobIdNameMapping(Object.assign({}, ...results_json.data.map((x) => ({ [x.id]: x.name }))));

    const job_ids = results_json.data.map((env) => env.id);

    const apiKeyMetadata = getPreferenceValues().dbtCloudMetadataAPIKey;

    // TODO: Check if we need to loop through jobs?
    const resultGQL = await fetch("https://metadata.cloud.getdbt.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${apiKeyMetadata}`,
      },
      body: JSON.stringify({
        query: `{
        models(
            jobId: ${job_ids[0]},
        ){
            uniqueId,
            name,
            materializedType,
            packageName
            }
        }`,
      }),
    });

    const resultGQLJSON = (await resultGQL.json()) as dbtGraphQLModelShort;
    // console.log(resultGQLJSON.data.models);

    setListModels(resultGQLJSON.data.models);
  }

  useEffect(() => {
    fetch_models();
  }, [envId]);

  return (
    <List navigationTitle="Select a Model" searchBarPlaceholder="Search your model" isLoading={listModels.length == 0}>
      {listModels?.map((item) => (
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

export function ModelDetails(props: { envId: string; uniqueId: string; jobIdNameMapping: Record<string, string> }) {
  const envId = props.envId;
  const uniqueId = props.uniqueId;
  const jobIdNameMapping = props.jobIdNameMapping;

  const [modelDetails, setModelDetails] = useState<Array<dbtModelByEnv>>([]);

  async function fetch_data() {
    const apiKeyMetadata = getPreferenceValues().dbtCloudMetadataAPIKey;

    const result = await fetch("https://metadata.cloud.getdbt.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${apiKeyMetadata}`,
      },
      body: JSON.stringify({
        query: `{
          modelByEnvironment(
              environmentId: ${envId},
              uniqueId: "${uniqueId}",
              lastRunCount:10,
              withCatalog: false
          ){
              executeCompletedAt,
              executeStartedAt,
              executionTime,
              error,
              status,
              runId, 
              runElapsedTime, 
              materializedType,
              jobId,
              runGeneratedAt,
              childrenL1,
              parentsModels {
                uniqueId
              }
              tests {
                name,
                state
              }
            }
          }`,
      }),
    });

    const resultJSON = (await result.json()) as dbtGraphQLModelByEnv;
    // console.log(resultJSON.data);
    // console.log(resultJSON);
    // console.log(resultJSON.data.modelByEnvironment.map(e => e.tests));
    // console.log(resultJSON.data.modelByEnvironment.map(e => e.childrenL1));
    setModelDetails(resultJSON.data.modelByEnvironment);

    return resultJSON;
  }

  useEffect(() => {
    fetch_data();
  }, [envId, uniqueId]);

  // jobs are not sorted properly in the API, sorting them here
  modelDetails.sort(function (a, b) {
    return (
      (b.executeCompletedAt !== null ? Date.parse(b.executeCompletedAt) : Date.parse(b.runGeneratedAt)) -
      (a.executeCompletedAt !== null ? Date.parse(a.executeCompletedAt) : Date.parse(a.runGeneratedAt))
    );
  });

  // console.log(modelDetails.map(e => e.executeCompletedAt !== null ? Date.parse(e.executeCompletedAt) : Date.parse(e.runGeneratedAt)));
  // console.log(modelDetails.map(e => e.executeCompletedAt ));
  // console.log(modelDetails.map(e => e.executeCompletedAt !== null ));

  const reversedModelDetails = modelDetails.slice().reverse();

  // const runIDs = reversedModelDetails.map((d) => d.runId + ` - ` + d.executeCompletedAt);
  const runIDs = reversedModelDetails.map((d) =>
    d.executeCompletedAt !== null
      ? d.executeCompletedAt.substring(0, 16).replace("T", " ")
      : d.runGeneratedAt.substring(0, 16).replace("T", " ")
  );
  const execTimesViews = reversedModelDetails.map((d) => (d.materializedType == "view" ? d.executionTime : ""));
  const execTimesTables = reversedModelDetails.map((d) => (d.materializedType == "table" ? d.executionTime : ""));
  const execTimesIncrementals = reversedModelDetails.map((d) =>
    d.materializedType == "incremental" ? d.executionTime : ""
  );
  const execTimesOthers = reversedModelDetails.map((d) =>
    d.materializedType != "view" && d.materializedType != "table" && d.materializedType != "incremental"
      ? d.executionTime
      : ""
  );

  const dbt_cloud_account = getPreferenceValues().dbtCloudAccountID;
  const dbt_cloud_project = getPreferenceValues().dbtCloudProjectID;

  const runsDetails = modelDetails.map((d) => ({
    jobId: `${d.jobId}`,
    runId: `${d.runId}`,
    runLink: `https://cloud.getdbt.com/#/accounts/${dbt_cloud_account}/projects/${dbt_cloud_project}/runs/${d.runId}/`,
    runMdLink: `[${d.runId}](https://cloud.getdbt.com/#/accounts/${dbt_cloud_account}/projects/${dbt_cloud_project}/runs/${d.runId}/)`,
  }));

  // console.log(runsDetails);

  const seed_url = "https://image-charts.com/chart?";

  // for handling dark mode and changing the text color from black to white
  const colorLabel: string = environment.theme == "dark" ? "FFFFFF" : "000000";

  const params = [
    `chd=t:` +
      execTimesViews.join(",") +
      `|` +
      execTimesTables.join(",") +
      `|` +
      execTimesIncrementals.join(",") +
      `|` +
      execTimesOthers.join(","), //data
    `chco=FF6849,195050,262A38,F1F1F1`, // color for the different data
    `chxt=x,y`, // axis types
    `chxl=0:|` + runIDs.join("|"), // x axis values
    `cht=bvs`, // chart tybe, bar chart
    `chs=700x450`, // size
    `chxs=0,${colorLabel},min40|1,${colorLabel}`, // rotation of the labels for the x axis and color
    `chdl=view|table|incr.|other`, // label names
    `chdls=${colorLabel}`, // label style
    `chf=a,s,00000000`, // transparent background
    `chtt=Model timing`, // title name
    `chts=${colorLabel},20`, //title style
  ];

  const params_url = params.join("&");
  const full_url = encodeURI(seed_url + params_url);
  // console.log(full_url)

  const nbTestsPass = reversedModelDetails.map((d) => d.tests.filter((e) => e.state == "pass").length);
  const nbTestsFail = reversedModelDetails.map((d) => d.tests.filter((e) => e.state == "fail").length);
  const nbTestsSkipped = reversedModelDetails.map((d) => d.tests.filter((e) => e.state == "skipped").length);
  const nbTestsOthers = reversedModelDetails.map(
    (d) => d.tests.filter((e) => e.state != "pass" && e.state != "fail" && e.state != "skipped").length
  );

  const params_tests = [
    `chd=t:` + nbTestsPass.join(",") + `|` + nbTestsFail.join(",") + `|` + nbTestsSkipped.join(","),
    +`|` + nbTestsOthers.join(","),
    `chco=195050,FF6849,262A38,F1F1F1`,
    `chxt=x,y`,
    `chxl=0:|` + runIDs.join("|"),
    `cht=bvs`,
    `chs=700x450`,
    `chxs=0,${colorLabel},min40|1,${colorLabel}`,
    `chdl=pass|fail|skipped|other`,
    `chdls=${colorLabel}`,
    `chf=a,s,00000000`,
    `chtt=Tests by status`,
    `chts=${colorLabel},20`,
  ];

  const params_url_tests = params_tests.join("&");
  const full_url_tests = encodeURI(seed_url + params_url_tests);

  // console.log(modelDetails !== undefined ? modelDetails[0].childrenL1 : 'undefined');
  // const children = modelDetails[0].childrenL1.filter(e => e.startsWith("model."));
  // const children = runIDs[0].childrenL1;
  // const children = runIDs[0].childrenL1;

  // console.log(full_url);

  return modelDetails.length > 0 ? (
    <Detail
      markdown={
        `![runs2](${full_url})` +
        `\n\n` +
        // + "```\n" + tablemark(runsDetails) + "\n```\n"
        `![runs2](${full_url_tests})` +
        "\n" +
        `### 10 previous runs\n` +
        `${runsDetails.map((url) => `- ` + url.runMdLink + " - " + jobIdNameMapping[url.jobId]).join("\n\n")} ` +
        "\n### Current tests\n" +
        `${
          modelDetails[0].tests.length > 0
            ? modelDetails[0].tests.map((test) => `- ` + test.name).join("\n\n")
            : "No tests 🙈"
        } `
      }
      navigationTitle="Model Details"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Model" text={uniqueId} />
          <Detail.Metadata.Label
            title="Last refreshed (UTC)"
            text={`${modelDetails
              .find((d) => d.executeCompletedAt !== null)
              ?.executeCompletedAt.substring(0, 16)
              .replace("T", " ")}`}
          />
          <Detail.Metadata.Label title="Current Materialization" text={modelDetails[0].materializedType} />
          <Detail.Metadata.Label
            title="Current Number of Tests"
            text={modelDetails[0].tests.map((e) => e.name).length.toString()}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Link
            title="Docs"
            target={`https://cloud.getdbt.com/accounts/${dbt_cloud_account}/jobs/${modelDetails[0].jobId}/docs/#!/model/${uniqueId}`}
            text={`Docs for the last job`}
          />
          <Detail.Metadata.Link
            title="Last run"
            target={`${runsDetails[0].runLink}`}
            text={`${runsDetails[0].runId}`}
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title="Open Docs in Browser"
            url={`https://cloud.getdbt.com/accounts/${dbt_cloud_account}/jobs/${modelDetails[0].jobId}/docs/#!/model/${uniqueId}`}
            icon={Icon.QuoteBlock}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
          />
          <Action.OpenInBrowser
            title="Open Last Run Details in Browser"
            url={`${runsDetails[0].runLink}`}
            shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
            icon={Icon.PlayFilled}
          />
          {modelDetails[0].childrenL1.length || modelDetails[0].parentsModels.length > 0 ? (
            <Action.Push
              title="See Parents and  Children"
              target={
                <ListParentChildren
                  envId={envId}
                  children={[...new Set(modelDetails[0].childrenL1.filter((e) => e.startsWith("model.")))]}
                  parents={modelDetails[0].parentsModels.map((e) => e.uniqueId)}
                  model={uniqueId}
                  jobIdNameMapping={jobIdNameMapping}
                />
              }
              icon={Icon.Code}
            />
          ) : (
            ""
          )}
          {/* <Action.CopyToClipboard
            title="Copy Pull Request URL"
            content="https://github.com/raycast/extensions/pull/1"
          /> */}
        </ActionPanel>
      }
    />
  ) : (
    <Detail navigationTitle="Details of the Model" isLoading={true} />
  );
}

// export function ListParentChildren(props: { envId: string, uniqueId: string }) {
export function ListParentChildren(props: {
  envId: string;
  children: Array<string>;
  parents: Array<string>;
  model: string;
  jobIdNameMapping: Record<string, string>;
}) {
  const envId = props.envId;
  const children = props.children;
  const parents = props.parents;
  const model = props.model;
  const jobIdNameMapping = props.jobIdNameMapping;

  return (
    <List navigationTitle={`Dependencies of ${model}`}>
      <List.Section title="Direct and Indirect Parents">
        {parents.map((node) => (
          <List.Item
            key={node}
            title={node.split(".")[2]}
            accessories={[{ text: node.split(".")[1], icon: Icon.Hammer }]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Show Details"
                  target={<ModelDetails envId={envId} uniqueId={node} jobIdNameMapping={jobIdNameMapping} />}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      <List.Section title="Direct Children">
        {children.map((node) => (
          <List.Item
            key={node}
            title={node.split(".")[2]}
            accessories={[{ text: node.split(".")[1], icon: Icon.Hammer }]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Show Details"
                  target={<ModelDetails envId={envId} uniqueId={node} jobIdNameMapping={jobIdNameMapping} />}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
