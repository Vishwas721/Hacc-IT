import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import all screens
import MyReportsScreen from './screens/MyReportsScreen';
import ReportDetailsScreen from './screens/ReportDetailsScreen';
import SubmitReportScreen from './screens/SubmitReportScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import WelcomeScreen from './screens/WelcomeScreen'; // <-- Import the new screen

const AppStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AppNavigator = () => {
    const { token, loading } = useAuth();

    if (loading) {
        return null; // Or a loading spinner for the whole app
    }

    return (
        <NavigationContainer>
            {token ? (
                // --- Main App (for logged-in users) ---
                <AppStack.Navigator 
                    screenOptions={{
                        headerStyle: { backgroundColor: '#6200ee' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                >
                    <AppStack.Screen 
                        name="MyReports" 
                        component={MyReportsScreen} 
                        options={{ title: 'My Reports' }}
                    />
                    <AppStack.Screen 
                        name="SubmitReport" 
                        component={SubmitReportScreen} 
                        options={{ title: 'Submit New Report' }}
                    />
                    <AppStack.Screen 
                        name="ReportDetails" 
                        component={ReportDetailsScreen}
                        options={{ title: 'Report Details' }}
                    />
                </AppStack.Navigator>
            ) : (
                // --- Authentication Flow (for new/logged-out users) ---
                <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
                    <AuthStack.Screen name="Login" component={LoginScreen} />
                    <AuthStack.Screen name="Register" component={RegisterScreen} />
                </AuthStack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <PaperProvider>
                <AppNavigator />
            </PaperProvider>
        </AuthProvider>
    );
}