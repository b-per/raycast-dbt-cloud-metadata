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
  project: {
    repository: {
      remote_url: string;
      remote_backend: string;
    };
  };
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
  path: string;
  root_path: string;
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
  dependsOn: Array<string>;
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

export interface dbtCloudConnection {
  id: number;
  account_id: number;
  project_id: number;
  name: string;
  type: string;
  created_by_id: number;
  created_by_service_token_id?: any;
  details: any;
  state: number;
  created_at: string;
  updated_at: string;
}

export interface dbtGitRepository {
  id: number;
  account_id: number;
  project_id: number;
  full_name: string;
  remote_url: string;
  remote_backend: string;
  git_clone_strategy: string;
  deploy_key_id: number;
  repository_credentials_id?: any;
  github_installation_id: number;
  pull_request_url_template: string;
  state: number;
  created_at: string;
  updated_at: string;
  deploy_key: any;
  github_repo: string;
  name: string;
  git_provider_id: number;
  gitlab?: any;
  git_provider?: any;
}

export interface dbtProject {
  name: string;
  account_id: number;
  repository_id: number;
  connection_id: number;
  id: number;
  created_at: string;
  updated_at: string;
  skipped_setup: boolean;
  state: number;
  dbt_project_subdirectory?: string;
  connection: dbtCloudConnection;
  repository: dbtGitRepository;
  group_permissions: any[];
  docs_job_id: number;
  freshness_job_id: number;
  docs_job: any;
  freshness_job: any;
}

export interface dbtProjectAnswer {
  status: {
    code: number;
    is_success: boolean;
    user_message: string;
    developer_message: string;
  };
  data: dbtProject;
}

export interface dbtRunsAnswer {
  status: {
    code: number;
    is_success: boolean;
    user_message: string;
    developer_message: string;
  };
  data: [
    {
      id: number;
      finished_at: number;
    }
  ];
}

// expand
export interface dbtManifest {
  nodes: Record<string, dbtManifestModel>;
}

export interface dbtManifestModel {
  unique_id: string;
  name: string;
  config: {
    materialized: string;
  };
  package_name: string;
  original_file_path: string;
  root_path: string;
  resource_type: string;
}
