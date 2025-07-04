// EnergyTune - Functional App with Entry System
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function App() {
  const [currentTab, setCurrentTab] = React.useState("Dashboard");
  const [energyLevel, setEnergyLevel] = React.useState(5);
  const [stressLevel, setStressLevel] = React.useState(5);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);

  const tabs = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Entry", icon: "➕" },
    { name: "Trends", icon: "📊" },
  ];

  const saveEntry = () => {
    const now = new Date();
    setLastSaved(now.toLocaleTimeString());
    // Here we would normally save to database
    console.log("Entry saved:", { energyLevel, stressLevel, time: now });
    Alert.alert("Success", "Entry saved successfully!");
  };

  const renderContent = () => {
    switch (currentTab) {
      case "Dashboard":
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to EnergyTune</Text>
            <Text style={styles.subtitle}>Your Energy & Stress Tracker</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today's Status</Text>
              <Text style={styles.cardText}>
                ✅ App is running successfully!
              </Text>
              <Text style={styles.cardText}>📱 Ready for daily tracking</Text>
              <Text style={styles.cardText}>
                ⚡ Energy: {energyLevel}/10 | 😰 Stress: {stressLevel}/10
              </Text>
              {lastSaved && (
                <Text style={styles.cardText}>💾 Last saved: {lastSaved}</Text>
              )}
            </View>
          </View>
        );
      case "Entry":
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Daily Entry</Text>
            <Text style={styles.subtitle}>Rate your energy and stress</Text>

            {/* Energy Rating */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Energy Level: {energyLevel}/10
              </Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.ratingButton,
                      energyLevel === num && styles.selectedEnergyButton,
                    ]}
                    onPress={() => setEnergyLevel(num)}
                  >
                    <Text
                      style={[
                        styles.ratingText,
                        energyLevel === num && styles.selectedText,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stress Rating */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Stress Level: {stressLevel}/10
              </Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.ratingButton,
                      stressLevel === num && styles.selectedStressButton,
                    ]}
                    onPress={() => setStressLevel(num)}
                  >
                    <Text
                      style={[
                        styles.ratingText,
                        stressLevel === num && styles.selectedText,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        );
      case "Trends":
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Trends</Text>
            <Text style={styles.subtitle}>View your patterns over time</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>7-Day Overview</Text>
              <Text style={styles.cardText}>
                📈 Chart visualization coming soon
              </Text>
              <Text style={styles.cardText}>📊 Pattern analysis ready</Text>
              <Text style={styles.cardText}>
                Current: ⚡{energyLevel} | 😰{stressLevel}
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tabButton,
              currentTab === tab.name && styles.activeTab,
            ]}
            onPress={() => setCurrentTab(tab.name)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                currentTab === tab.name && styles.activeTabLabel,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  selectedEnergyButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  selectedStressButton: {
    backgroundColor: "#FF9500",
    borderColor: "#FF9500",
  },
  ratingText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  selectedText: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#34C759",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
