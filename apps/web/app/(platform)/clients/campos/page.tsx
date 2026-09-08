import { CustomFieldsPage } from "@/components/clients/custom-fields";
import { getCustomFieldsPageDataAction } from "@/app/clients/custom-field-actions";

export default async function CustomFieldsRoute() {
  const { fields, canManage } = await getCustomFieldsPageDataAction();
  return <CustomFieldsPage initialFields={fields} canManage={canManage} />;
}
