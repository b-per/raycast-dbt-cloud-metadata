import { getPreferenceValues, Toast, showToast } from "@raycast/api";
import fetch from "node-fetch";

export async function fetchCloudApiData(api_url: string) {
  const apiKey = getPreferenceValues().dbtCloudAdminAPIKey;
  
  try {
    const result = await fetch(api_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
    });
    return await result.json();}
  catch(error) {
    console.log(error)
    showToast({
      title: "dbt Cloud Admin API Error",
      message: "Could not fetch data from the API",
      style: Toast.Style.Failure,
    })
    return undefined
  }
}

export async function fetchMetadataApiData(graphql_query: string) {
  const apiKey = getPreferenceValues().dbtCloudMetadataAPIKey;
  try {
    const result = await fetch("https://metadata.cloud.getdbt.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Token ${apiKey}`,
    },
    body: JSON.stringify({
      query: graphql_query,
    }),
    });
    const res = await result.json();
    if (res["errors"] === undefined){
      return res
    } else {
      console.log(res["errors"])
      showToast({
        title: "Metadata API Error",
        message: res["errors"][0]["message"],
        // message: "Yep, error...",
        style: Toast.Style.Failure,
      })
      return undefined
    }
    // return await result.json()
  }
  catch(error) {
    console.log(error)
    showToast({
      title: "Metadata API Error",
      message: "Issue when connecting",
      style: Toast.Style.Failure,
    })
    return undefined
  }
}
