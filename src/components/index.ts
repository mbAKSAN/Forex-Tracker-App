import type { App } from "vue";
import BaseDataTable from "@/components/molecules/BaseDataTable.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import PageHeader from "@/components/organism/PageHeader.vue";
import ChangeIndicator from "@/components/organism/ChangeIndicator.vue";
import BuyDialog from "@/components/atoms/BuyDialog.vue";

export function registerGlobalComponents(app: App) {
  app.component("BaseButton", BaseButton);
  app.component("BaseDataTable", BaseDataTable);
  app.component("PageHeader", PageHeader);
  app.component("ChangeIndicator", ChangeIndicator);
  app.component("BuyDialog", BuyDialog);
}

export { BaseButton, BaseDataTable, PageHeader, ChangeIndicator, BuyDialog };

export default {
  BaseButton,
  BaseDataTable,
  PageHeader,
  ChangeIndicator,
  BuyDialog,
};
