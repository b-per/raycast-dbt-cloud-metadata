import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { dbtEnv, dbtModelShort } from "../types";
import { ModelDetails } from "./modelDetails";

export function ListParentChildren(props: {
  env: dbtEnv;
  children: Array<dbtModelShort>;
  parents: Array<dbtModelShort>;
  model: string;
  listModels: Array<dbtModelShort>;
  jobIdNameMapping: Record<string, string>;
  directParentsUniqueId: Array<string>;
}) {
  const env = props.env;
  const children = props.children;
  const parents = props.parents;
  const model = props.model;
  const listModels = props.listModels;
  const jobIdNameMapping = props.jobIdNameMapping;
  const directParentsUniqueId = props.directParentsUniqueId;

  return (
    <List navigationTitle={`Dependencies of ${model}`}>
      <List.Section title="Direct and Indirect Parents">
        {parents.map((node) => (
          <List.Item
            key={node.uniqueId}
            title={node.name}
            subtitle={node.materializedType}
            // subtitle={(node.materializedType + " - " ) + directParentsUniqueId.includes(node.uniqueId) ? "Direct Parent" : "Indirect Parent"}
            accessories={[{ text: node.packageName, icon: Icon.Hammer }]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Show Details"
                  target={
                    <ModelDetails env={env} model={node} jobIdNameMapping={jobIdNameMapping} listModels={listModels} />
                  }
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      <List.Section title="Direct Children">
        {children.map((node) => (
          <List.Item
            key={node.uniqueId}
            title={node.name}
            subtitle={node.materializedType}
            accessories={[{ text: node.packageName, icon: Icon.Hammer }]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Show Details"
                  target={
                    <ModelDetails env={env} model={node} jobIdNameMapping={jobIdNameMapping} listModels={listModels} />
                  }
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
