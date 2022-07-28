import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";

export async function fetchCloudApiData(api_url: string) {
  const apiKey = getPreferenceValues().dbtCloudAdminAPIKey;
  const result = await fetch(api_url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Token ${apiKey}`,
    },
  });
  return await result.json();
}

export async function fetchMetadataApiData(graphql_query: string) {
  const apiKey = getPreferenceValues().dbtCloudAdminAPIKey;
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
  return await result.json();
}
