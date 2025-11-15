<script lang="ts">
  import { getComponentFromSchema } from '$lib/utils/workflow';
  import { Field, Input, Select, Switch, type SelectItem } from '@immich/ui';

  interface Props {
    schema: object | null;
    config: Record<string, unknown>;
  }

  let { schema = null, config = $bindable({}) }: Props = $props();

  const components = $derived(getComponentFromSchema(schema));

  let selectValue = $state<SelectItem>();
  let switchValue = $state<boolean>(false);

  $effect(() => {
    if (components) {
      const updates: Record<string, unknown> = {};

      for (const [key, component] of Object.entries(components)) {
        if (component.defaultValue !== undefined) {
          updates[key] = component.defaultValue;

          if (component.type === 'select') {
            selectValue = {
              label: String(component.defaultValue),
              value: String(component.defaultValue),
            };
          }

          if (component.type === 'switch') {
            switchValue = Boolean(component.defaultValue);
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        config = { ...updates };
      }
    }
  });
</script>

{#if components}
  <div class="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
    {#each Object.entries(components) as [key, component] (key)}
      <div class="flex flex-col gap-1">
        <code>Component type: {component.type} {key}</code>
        <!-- Select component -->
        {#if component.type === 'select'}
          {@const options = component.options?.map((opt) => {
            return { label: opt.label, value: String(opt.value) };
          }) || [{ label: 'N/A', value: '' }]}

          <Field
            label={component.label}
            required={component.required}
            description={component.description}
            requiredIndicator={component.required}
          >
            <Select data={options} onChange={(opt) => (config[key] = opt.value)} bind:value={selectValue} />
          </Field>

          <!-- MultiSelect component -->
        {:else if component.type === 'multiselect'}
          <div>
            <p>Subtype</p>
            <code>{component.subType}</code>
          </div>
          <div class="text-sm font-medium">
            {component.label}
            {#if component.required}<span class="text-red-500">*</span>{/if}
          </div>
          <div class="flex flex-col gap-2">
            {#each component.options || [] as option (option.label)}
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(config[key]) && (config[key] as unknown[]).includes(option.value)}
                  onchange={(e) => {
                    if (!Array.isArray(config[key])) {
                      config[key] = [];
                    }
                    const currentArray = config[key] as unknown[];
                    config[key] = e.currentTarget.checked
                      ? [...currentArray, option.value]
                      : currentArray.filter((v: unknown) => v !== option.value);
                  }}
                  class="immich-form-checkbox"
                />
                <span class="text-sm">{option.label}</span>
              </label>
            {/each}
          </div>
          {#if component.description}
            <p class="text-xs text-gray-500 dark:text-gray-400">{component.description}</p>
          {/if}

          <!-- Switch component -->
        {:else if component.type === 'switch'}
          <Field
            label={component.label}
            description={component.description}
            requiredIndicator={component.required}
            required={component.required}
          >
            <Switch bind:checked={switchValue} onCheckedChange={(check) => (config[key] = check)} />
          </Field>

          <!-- Text input -->
        {:else}
          <Field
            label={component.label}
            description={component.description}
            requiredIndicator={component.required}
            required={component.required}
          >
            <Input
              id={key}
              bind:value={config[key] as string}
              placeholder={component.placeholder}
              required={component.required}
            />
          </Field>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <p class="text-sm text-gray-500">No configuration required</p>
{/if}
