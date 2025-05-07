"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Switch,
  Platform,
} from "react-native";
import {
  getAuth,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../../src/context/ThemeContext";
import Dialog from "react-native-dialog";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, listAll, ref } from "firebase/storage";
import { db, storage } from "../../../src/firebase/config";
import Animated, {
  FadeInDown,
  FadeIn,
  SlideInLeft,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const router = useRouter();
  const { colors, scheme, toggle } = useTheme();
  const isSocialLogin = user?.providerData?.[0]?.providerId !== "password";
  const version =
    Application.nativeApplicationVersion || "Version information not found";

  const [showDialog, setShowDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      if (hapticEnabled && Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            router.replace("/(auth)/welcome");
          },
        },
      ]);
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Could not log out, please try again.");
    }
  };

  const handleDeleteAccount = () => {
    if (hapticEnabled && Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Alert.alert(
      "Warning!",
      "This action will permanently delete your account, all photos you've created, and all saved data. This action cannot be undone. Do you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Continue",
          style: "destructive",
          onPress: () => setShowDialog(true),
        },
      ]
    );
  };

  const handleDeleteConfirmed = async () => {
    setShowDialog(false);
    const password = passwordInput;
    setPasswordInput("");

    if (!user || !password) return;

    try {
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);

      const uid = user.uid;

      // Firestore: delete user info
      await deleteDoc(doc(db, "users", uid));

      // Storage: delete generatedImages/{uid}
      const generatedRef = ref(storage, `generatedImages/${uid}`);
      const generatedFiles = await listAll(generatedRef);
      for (const item of generatedFiles.items) {
        await deleteObject(item);
      }

      // Storage: delete uploads/{uid}
      const uploadsRef = ref(storage, `uploads/${uid}`);
      const uploadFiles = await listAll(uploadsRef);
      for (const item of uploadFiles.items) {
        await deleteObject(item);
      }

      // Delete auth account
      await deleteUser(user);

      if (hapticEnabled && Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Deleted",
        "Your account and all your data have been removed."
      );
      router.replace("/(auth)/welcome");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleSupport = () => {
    if (hapticEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert("Support", "Please send an email to 4.dort.studios@gmail.com.");
  };

  const toggleHaptic = () => {
    if (hapticEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setHapticEnabled(!hapticEnabled);
  };

  const toggleTheme = () => {
    if (hapticEnabled && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggle();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.DEFAULT }}>
      <LinearGradient
        colors={
          scheme === "dark"
            ? [colors.bg.DEFAULT, colors.primary[900]]
            : [colors.bg.DEFAULT, colors.primary[50]]
        }
        style={{ flex: 1 }}
      >
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.headerContainer}
        >
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor:
                  scheme === "dark" ? colors.surface[100] : colors.primary[100],
              },
            ]}
            onPress={() => {
              if (hapticEnabled && Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
          >
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: colors.text.primary }]}>
            Settings
          </Text>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Account */}
          <Animated.View
            entering={SlideInLeft.delay(100).duration(600)}
            style={[
              styles.card,
              {
                backgroundColor:
                  scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT,
                borderColor:
                  scheme === "dark" ? colors.primary[800] : colors.primary[200],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={colors.primary.DEFAULT}
              />
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                Account
              </Text>
            </View>

            {isSocialLogin ? (
              <Text style={[styles.info, { color: colors.text.secondary }]}>
                This account was created with a Google/Apple account, so
                password and email cannot be changed.
              </Text>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: colors.primary.DEFAULT },
                  ]}
                  onPress={() => {
                    if (hapticEnabled && Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push("/profileScreens/changePassword");
                  }}
                >
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color={colors.text.inverse}
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[styles.buttonText, { color: colors.text.inverse }]}
                  >
                    Change Password
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: colors.primary.DEFAULT },
                  ]}
                  onPress={() => {
                    if (hapticEnabled && Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push("/profileScreens/changeEmail");
                  }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.text.inverse}
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[styles.buttonText, { color: colors.text.inverse }]}
                  >
                    Change Email
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.error.DEFAULT }]}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.text.inverse}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* App */}
          <Animated.View
            entering={SlideInLeft.delay(200).duration(600)}
            style={[
              styles.card,
              {
                backgroundColor:
                  scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT,
                borderColor:
                  scheme === "dark" ? colors.primary[800] : colors.primary[200],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.primary.DEFAULT}
              />
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                App
              </Text>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Ionicons
                  name={scheme === "dark" ? "moon-outline" : "sunny-outline"}
                  size={20}
                  color={colors.text.primary}
                  style={styles.settingIcon}
                />
                <Text
                  style={[styles.settingLabel, { color: colors.text.primary }]}
                >
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={scheme === "dark"}
                onValueChange={toggleTheme}
                trackColor={{
                  false: colors.surface[100],
                  true: colors.primary.DEFAULT,
                }}
                thumbColor={
                  scheme === "dark" ? colors.success.DEFAULT : "#f4f3f4"
                }
              />
            </View>

            {Platform.OS !== "web" && (
              <View style={styles.settingRow}>
                <View style={styles.settingLabelContainer}>
                  <MaterialCommunityIcons
                    name="vibrate"
                    size={20}
                    color={colors.text.primary}
                    style={styles.settingIcon}
                  />
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: colors.text.primary },
                    ]}
                  >
                    Haptic Feedback
                  </Text>
                </View>
                <Switch
                  value={hapticEnabled}
                  onValueChange={toggleHaptic}
                  trackColor={{
                    false: colors.surface[100],
                    true: colors.primary.DEFAULT,
                  }}
                  thumbColor={
                    hapticEnabled ? colors.success.DEFAULT : "#f4f3f4"
                  }
                />
              </View>
            )}
          </Animated.View>

          {/* Privacy */}
          <Animated.View
            entering={SlideInLeft.delay(300).duration(600)}
            style={[
              styles.card,
              {
                backgroundColor:
                  scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT,
                borderColor:
                  scheme === "dark" ? colors.primary[800] : colors.primary[200],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={colors.primary.DEFAULT}
              />
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                Privacy
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary.DEFAULT },
              ]}
              onPress={() => {
                if (hapticEnabled && Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                Linking.openURL("https://legal.4studios.com.tr/");
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.text.inverse}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.error.DEFAULT }]}
              onPress={handleDeleteAccount}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.text.inverse}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                Delete My Data
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Support */}
          <Animated.View
            entering={SlideInLeft.delay(400).duration(600)}
            style={[
              styles.card,
              {
                backgroundColor:
                  scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT,
                borderColor:
                  scheme === "dark" ? colors.primary[800] : colors.primary[200],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={colors.primary.DEFAULT}
              />
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                Support
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary.DEFAULT },
              ]}
              onPress={handleSupport}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.text.inverse}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                Contact Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.success.DEFAULT }]}
              onPress={() => {
                if (hapticEnabled && Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                Linking.openURL("https://4studios.com.tr/faq");
              }}
            >
              <Ionicons
                name="help-buoy-outline"
                size={20}
                color={colors.text.inverse}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: colors.text.inverse }]}>
                FAQ
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* About */}
          <Animated.View
            entering={SlideInLeft.delay(500).duration(600)}
            style={[
              styles.card,
              {
                backgroundColor:
                  scheme === "dark" ? colors.surface[100] : colors.bg.DEFAULT,
                borderColor:
                  scheme === "dark" ? colors.primary[800] : colors.primary[200],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.primary.DEFAULT}
              />
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                About
              </Text>
            </View>

            <Text style={[styles.info, { color: colors.text.secondary }]}>
              This app is a photo editing tool that allows users to apply
              creative styles and effects to their photos to achieve different
              results using AI technology.
            </Text>

            <View style={styles.versionContainer}>
              <Text
                style={[styles.versionLabel, { color: colors.text.secondary }]}
              >
                Version
              </Text>
              <Text
                style={[styles.versionText, { color: colors.text.primary }]}
              >
                {version}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Dialog */}
        <Dialog.Container visible={showDialog}>
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Description>
            Please enter your password to continue.
          </Dialog.Description>
          <Dialog.Input
            placeholder="Your password"
            secureTextEntry
            value={passwordInput}
            onChangeText={setPasswordInput}
          />
          <Dialog.Button label="Cancel" onPress={() => setShowDialog(false)} />
          <Dialog.Button label="Delete" onPress={handleDeleteConfirmed} />
        </Dialog.Container>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  versionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.2)",
  },
  versionLabel: {
    fontSize: 14,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
