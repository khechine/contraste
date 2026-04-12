import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useAuth } from '../src/context/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
    } catch (e: any) {
      console.error('Login error:', e);
      setError(e.message || 'Identifiants invalides ou erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.tint }]}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Contraste Éditions
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Espace Administrateur
          </Text>
        </View>

        <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.tint}
            textColor={colors.text}
          />

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoComplete="password"
            style={styles.input}
            outlineColor={Colors.light.border}
            activeOutlineColor={Colors.light.tint}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {error && (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={[styles.button, { backgroundColor: colors.tint }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </View>

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          © 2026 Contraste Éditions
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.large,
  },
  logoLetter: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  input: {
    marginBottom: Spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  buttonContent: {
    paddingVertical: Spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.xxxl,
    fontSize: 12,
  },
});
