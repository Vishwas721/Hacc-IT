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
import WelcomeScreen from './screens/WelcomeScreen';
import PublicDashboardScreen from './screens/PublicDashboardScreen'; // <-- Import new screen

const AppStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const THEME_COLOR = '#6200ee'; // Your purple theme color

const AppNavigator = () => {
    const { token, loading } = useAuth();

    if (loading) {
        return null; // Or a loading spinner
    }

    return (
        <NavigationContainer>
            {token ? (
                // --- Main App (for logged-in users) ---
                <AppStack.Navigator 
                    screenOptions={{
                        headerStyle: { backgroundColor: THEME_COLOR },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                >
                    <AppStack.Screen 
                        name="MyReports" 
                        component={MyReportsScreen} 
                        options={{ title: 'My Submitted Reports' }}
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
                <AuthStack.Navigator>
                    <AuthStack.Screen 
                        name="Welcome" 
                        component={WelcomeScreen} 
                        options={{ headerShown: false }}
                    />
                    <AuthStack.Screen 
                        name="Login" 
                        component={LoginScreen} 
                        options={{ title: 'Login' }}
                    />
                    <AuthStack.Screen 
                        name="Register" 
                        component={RegisterScreen} 
                        options={{ title: 'Create Account' }}
                    />
                    <AuthStack.Screen 
                        name="PublicDashboard" 
                        component={PublicDashboardScreen}
                        options={{ title: 'Public Dashboard' }}
                    />
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