import { ActionPanel, List, Action, getPreferenceValues } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

import { fetchCloudApiData, fetchMetadataApiData } from "./utils/fetchApis";

import { useEffect, useState } from "react";
import fetch from "node-fetch";

const projectId = getPreferenceValues().dbtCloudProjectID;

import { Environments } from "./components/environments";

// import tablemark from "tablemark"

// const accountId = getPreferenceValues().dbtCloudAccountID;
// const projectId = getPreferenceValues().dbtCloudProjectID;

import { dbtEnvAnswer, dbtEnv, dbtProjectAnswer } from "./types";


export default function Command() {
  
  return (
    <Environments projectId={projectId}/>
  );
}

// To get the list of models, we get the list of jobs and search for the models
