import React, { Suspense, lazy } from "react";
import { useColorScheme } from "react-native";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoadingState from "./components/LoadingState";

const LoginScreen = lazy(() => import("./screens/LoginScreen"));
const RegisterScreen = lazy(() => import("./screens/RegisterScreen"));
const HomeScreen = lazy(() => import("./screens/HomeScreen"));
const AddIncident = lazy(() => import("./screens/AddIncident"));
const IncidentsScreen = lazy(() => import("./screens/IncidentsScreen"));
const SOSScreen = lazy(() => import("./screens/SOSScreen"));
const ContactsScreen = lazy(() => import("./screens/ContactsScreen"));
const ReportScreen = lazy(() => import("./screens/ReportScreen"));

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Suspense fallback={<LoadingState label="Loading screen..." />}>
        <Stack.Navigator
          screenOptions={{
            animation: "slide_from_right",
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddIncident" component={AddIncident} options={{ title: "Secure Incident Upload" }} />
          <Stack.Screen name="Incidents" component={IncidentsScreen} options={{ title: "Encrypted Incidents" }} />
          <Stack.Screen name="SOS" component={SOSScreen} options={{ title: "Emergency SOS" }} />
          <Stack.Screen name="Contacts" component={ContactsScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}
