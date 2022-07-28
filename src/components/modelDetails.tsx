import { Action, ActionPanel, Detail, getPreferenceValues, Icon, List } from "@raycast/api";
import { dbtGraphQLModelByEnv, dbtModelByEnv } from "../types";
import { fetchMetadataApiData } from "../utils/fetchApis";
import { useEffect, useState } from "react";
import { generateChartURL } from "../utils/generateChartURL";
import { ListParentChildren } from "./listParentChildren";

export function ModelDetails(props: { envId: string; uniqueId: string; jobIdNameMapping: Record<string, string> }) {
    const envId = props.envId;
    const uniqueId = props.uniqueId;
    const jobIdNameMapping = props.jobIdNameMapping;
  
    const [modelDetails, setModelDetails] = useState<Array<dbtModelByEnv>>([]);
  
    async function fetchModelDetails() {
  
      const graphql_query = `{
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
        }`
      const resultJSON = (await fetchMetadataApiData(graphql_query)) as dbtGraphQLModelByEnv;
  
      // console.log(resultJSON.data.modelByEnvironment.map(e => e.tests));
      // console.log(resultJSON.data.modelByEnvironment.map(e => e.childrenL1));
      setModelDetails(resultJSON.data.modelByEnvironment);
  
      return resultJSON;
    }
  
    useEffect(() => {
      fetchModelDetails();
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
    const execTimesViews = reversedModelDetails.map((d) => (d.materializedType == "view" ? d.executionTime : 0));
    const execTimesTables = reversedModelDetails.map((d) => (d.materializedType == "table" ? d.executionTime : 0));
    const execTimesIncrementals = reversedModelDetails.map((d) =>
      d.materializedType == "incremental" ? d.executionTime : 0
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
  
  
  
    const full_url = generateChartURL([execTimesViews,execTimesTables,execTimesIncrementals],runIDs,'Model timing',['view','table','incr.','other']);
    console.log(full_url);
  
    
    const nbTestsPass = reversedModelDetails.map((d) => d.tests.filter((e) => e.state == "pass").length);
    const nbTestsFail = reversedModelDetails.map((d) => d.tests.filter((e) => e.state == "fail").length);
    const nbTestsSkipped = reversedModelDetails.map((d) => d.tests.filter((e) => e.state == "skipped").length);
    const nbTestsOthers = reversedModelDetails.map(
      (d) => d.tests.filter((e) => e.state != "pass" && e.state != "fail" && e.state != "skipped").length
      );
      
    const full_url_tests = generateChartURL([nbTestsPass,nbTestsFail,nbTestsSkipped,nbTestsOthers],runIDs,'Tests by status',['pass','fail','skipped','other']);
      
  
  
    // console.log(modelDetails !== undefined ? modelDetails[0].childrenL1 : 'undefined');
    // const children = modelDetails[0].childrenL1.filter(e => e.startsWith("model."));
    // const children = runIDs[0].childrenL1;
    // const children = runIDs[0].childrenL1;
  
  
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
  