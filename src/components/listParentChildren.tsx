import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { ModelDetails } from "./modelDetails";

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
