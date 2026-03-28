import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AddIncident from "./screens/AddIncident";
import IncidentsScreen from "./screens/IncidentsScreen";
import SOSScreen from "./screens/SOSScreen";
import ContactsScreen from "./screens/ContactsScreen";
import ReportScreen from "./screens/ReportScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddIncident" component={AddIncident} />
        <Stack.Screen name="Incidents" component={IncidentsScreen} />
        <Stack.Screen name="SOS" component={SOSScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
