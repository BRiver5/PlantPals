import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  MyPlants: undefined;
  Stats: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList>;
  AddEditPlant: { plantId?: number } | undefined;
  PlantDetail: { plantId: number };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
