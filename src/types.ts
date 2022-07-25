export interface RunModel {
  id: number;
  trigger_id: number;
  account_id: number;
  environment_id: number;
  project_id: number;
  job_definition_id: number;
  status: number;
  dbt_version: number;
  git_branch: string;
  git_sha: string;
  status_message: string;
  owner_thread_id: number;
  executed_by_thread_id: string;
  deferring_run_id: number;
  artifacts_saved: boolean;
  artifact_s3_path: string;
  has_docs_generated: boolean;
  has_sources_generated: boolean;
  notifications_sent: boolean;
  scribe_enabled: boolean;
  created_at: string;
  updated_at: string;
  dequeued_at: string;
  started_at: string;
  finished_at: string;
  should_start_at: string;
  href: string;
  status_humanized: string;
  finished_at_humanized: string;
  job: {
    name: string;
  };
}

export interface Preferences {
  dbtCloudAPIToken: string;
  dbtCloudAcountID: string;
}

export interface dbtEnvWithName {
  name: string;
  id: number;
}

export interface dbtEnv {
  id: number;
  account_id: number;
  project_id: number;
  credentials_id: number;
  name: string;
  dbt_version: string;
  type: string;
  use_custom_branch: boolean;
  custom_branch: string;
  supports_docs: boolean;
  state: number;
  created_at: string;
  updated_at: string;
  project: [unknown];
  jobs: string;
  credentials: string;
  custom_environment_variables: string;
}

export interface dbtEnvAnswer {
  status: {
    code: number;
    is_success: boolean;
    user_message: string;
    developer_message: string;
  };
  data: Array<dbtEnv>;
}

export interface dbtJobsAnswer {
  status: {
    code: number;
    is_success: boolean;
    user_message: string;
    developer_message: string;
  };
  data: Array<dbtJob>;
}

export interface dbtJob {
  execution: string;
  generate_docs: boolean;
  run_generate_sources: boolean;
  id: number;
  account_id: number;
  project_id: number;
  environment_id: number;
  name: string;
  dbt_version: string;
  created_at: string;
  updated_at: string;
  execute_steps: Array<string>;
  state: number;
  deactivated: boolean;
  run_failure_count: number;
  deferring_job_definition_id: number;
  lifecycle_webhooks: boolean;
  lifecycle_webhooks_url: string;
  triggers: [unknown];
  settings: [unknown];
  schedule: [unknown];
  is_deferrable: boolean;
  generate_sources: boolean;
  cron_humanized: string;
  next_run: string;
  next_run_humanized: string;
}

export interface dbtModelShort {
  uniqueId: string;
  name: string;
  materializedType: string;
  packageName: string;
}

export interface dbtGraphQLModelShort {
  data: {
    models: Array<dbtModelShort>;
  };
}

export interface dbtModelByEnv {
  executeCompletedAt: string;
  executeStartedAt: string;
  executionTime: number;
  error: string;
  status: string;
  runId: number;
  runElapsedTime: number;
  materializedType: string;
  jobId: number;
  runGeneratedAt: string;
  childrenL1: Array<string>;
  parentsModels: Array<{
    uniqueId: string;
  }>;
  tests: Array<{
    name: string;
    state: string;
  }>;
}

export interface dbtGraphQLModelByEnv {
  data: {
    modelByEnvironment: Array<dbtModelByEnv>;
  };
}
