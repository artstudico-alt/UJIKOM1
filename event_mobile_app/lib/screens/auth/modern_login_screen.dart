import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ModernLoginScreen extends StatefulWidget {
  const ModernLoginScreen({super.key});

  @override
  State<ModernLoginScreen> createState() => _ModernLoginScreenState();
}

class _ModernLoginScreenState extends State<ModernLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;
  bool _rememberMe = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF8B5CF6), // Purple
              Color(0xFF3B82F6), // Blue
              Color(0xFF1E40AF), // Dark Blue
            ],
            stops: [0.0, 0.6, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header Section with Logo
              Expanded(
                flex: 2,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Logo
                      Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.3),
                                width: 2,
                              ),
                            ),
                            child: const Icon(
                              Icons.event_available,
                              color: Colors.white,
                              size: 40,
                            ),
                          )
                          .animate()
                          .scale(duration: 800.ms, curve: Curves.elasticOut)
                          .fadeIn(duration: 600.ms),

                      const SizedBox(height: 24),

                      // App Title
                      Text(
                            'EVENTHUB',
                            style: Theme.of(context).textTheme.headlineMedium
                                ?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2,
                                ),
                          )
                          .animate()
                          .fadeIn(duration: 800.ms, delay: 200.ms)
                          .slideY(
                            begin: 0.3,
                            end: 0,
                            duration: 800.ms,
                            delay: 200.ms,
                          ),

                      const SizedBox(height: 8),

                      Text(
                            'Discover Amazing Events',
                            style: Theme.of(context).textTheme.bodyLarge
                                ?.copyWith(
                                  color: Colors.white.withOpacity(0.8),
                                  fontWeight: FontWeight.w300,
                                ),
                          )
                          .animate()
                          .fadeIn(duration: 800.ms, delay: 400.ms)
                          .slideY(
                            begin: 0.3,
                            end: 0,
                            duration: 800.ms,
                            delay: 400.ms,
                          ),
                    ],
                  ),
                ),
              ),

              // Login Form Section
              Expanded(
                flex: 3,
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(32),
                      topRight: Radius.circular(32),
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Welcome Text
                          Text(
                                'Welcome back!',
                                style: Theme.of(context).textTheme.headlineSmall
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                    ),
                              )
                              .animate()
                              .fadeIn(duration: 600.ms, delay: 600.ms)
                              .slideX(
                                begin: -0.3,
                                end: 0,
                                duration: 600.ms,
                                delay: 600.ms,
                              ),

                          const SizedBox(height: 32),

                          // Username Field
                          _buildInputField(
                                controller: _usernameController,
                                label: 'Username',
                                icon: Icons.person_outline,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter your username';
                                  }
                                  return null;
                                },
                              )
                              .animate()
                              .fadeIn(duration: 600.ms, delay: 800.ms)
                              .slideX(
                                begin: -0.3,
                                end: 0,
                                duration: 600.ms,
                                delay: 800.ms,
                              ),

                          const SizedBox(height: 20),

                          // Password Field
                          _buildPasswordField()
                              .animate()
                              .fadeIn(duration: 600.ms, delay: 1000.ms)
                              .slideX(
                                begin: -0.3,
                                end: 0,
                                duration: 600.ms,
                                delay: 1000.ms,
                              ),

                          const SizedBox(height: 20),

                          // Remember Me & Forgot Password
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Checkbox(
                                    value: _rememberMe,
                                    onChanged: (value) {
                                      setState(() {
                                        _rememberMe = value ?? false;
                                      });
                                    },
                                    activeColor: const Color(0xFF8B5CF6),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                  Text(
                                    'Remember me',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          color: const Color(0xFF6B7280),
                                        ),
                                  ),
                                ],
                              ),
                              TextButton(
                                onPressed: () {
                                  // TODO: Navigate to forgot password
                                },
                                child: Text(
                                  'Forgot password?',
                                  style: Theme.of(context).textTheme.bodyMedium
                                      ?.copyWith(
                                        color: const Color(0xFF8B5CF6),
                                        fontWeight: FontWeight.w500,
                                      ),
                                ),
                              ),
                            ],
                          ).animate().fadeIn(duration: 600.ms, delay: 1200.ms),

                          const SizedBox(height: 32),

                          // Login Button
                          SizedBox(
                                width: double.infinity,
                                height: 56,
                                child: ElevatedButton(
                                  onPressed: () {
                                    if (_formKey.currentState?.validate() ??
                                        false) {
                                      // TODO: Handle login
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                      side: const BorderSide(
                                        width: 2,
                                        color: Color(0xFF8B5CF6),
                                      ),
                                    ),
                                  ),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(
                                        colors: [
                                          Color(0xFF8B5CF6),
                                          Color(0xFF3B82F6),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: const Center(
                                      child: Text(
                                        'Login',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              )
                              .animate()
                              .fadeIn(duration: 600.ms, delay: 1400.ms)
                              .slideY(
                                begin: 0.3,
                                end: 0,
                                duration: 600.ms,
                                delay: 1400.ms,
                              ),

                          const SizedBox(height: 24),

                          // Sign Up Link
                          Center(
                            child: RichText(
                              text: TextSpan(
                                text: 'New user? ',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: const Color(0xFF6B7280)),
                                children: [
                                  TextSpan(
                                    text: 'Sign Up',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(
                                          color: const Color(0xFF8B5CF6),
                                          fontWeight: FontWeight.w600,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                          ).animate().fadeIn(duration: 600.ms, delay: 1600.ms),

                          const SizedBox(height: 32),

                          // OR Divider
                          Row(
                            children: [
                              const Expanded(
                                child: Divider(color: Color(0xFFE5E7EB)),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                child: Text(
                                  'OR',
                                  style: Theme.of(context).textTheme.bodySmall
                                      ?.copyWith(
                                        color: const Color(0xFF9CA3AF),
                                        fontWeight: FontWeight.w500,
                                      ),
                                ),
                              ),
                              const Expanded(
                                child: Divider(color: Color(0xFFE5E7EB)),
                              ),
                            ],
                          ).animate().fadeIn(duration: 600.ms, delay: 1800.ms),

                          const SizedBox(height: 24),

                          // Social Login Buttons
                          Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceEvenly,
                                children: [
                                  _buildSocialButton(
                                    Icons.g_mobiledata,
                                    const Color(0xFF4285F4),
                                  ),
                                  _buildSocialButton(
                                    Icons.facebook,
                                    const Color(0xFF1877F2),
                                  ),
                                  _buildSocialButton(
                                    Icons.alternate_email,
                                    const Color(0xFF1DA1F2),
                                  ),
                                  _buildSocialButton(
                                    Icons.business,
                                    const Color(0xFF0077B5),
                                  ),
                                ],
                              )
                              .animate()
                              .fadeIn(duration: 600.ms, delay: 2000.ms)
                              .slideY(
                                begin: 0.3,
                                end: 0,
                                duration: 600.ms,
                                delay: 2000.ms,
                              ),

                          const SizedBox(height: 16),

                          // Sign in with another account
                          Center(
                            child: TextButton(
                              onPressed: () {
                                // TODO: Handle alternative sign in
                              },
                              child: Text(
                                'Sign in with another account',
                                style: Theme.of(context).textTheme.bodySmall
                                    ?.copyWith(color: const Color(0xFF9CA3AF)),
                              ),
                            ),
                          ).animate().fadeIn(duration: 600.ms, delay: 2200.ms),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF8B5CF6)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 2),
        ),
        filled: true,
        fillColor: const Color(0xFFF9FAFB),
      ),
    );
  }

  Widget _buildPasswordField() {
    return TextFormField(
      controller: _passwordController,
      obscureText: !_isPasswordVisible,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter your password';
        }
        return null;
      },
      decoration: InputDecoration(
        labelText: 'Password',
        prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF8B5CF6)),
        suffixIcon: IconButton(
          icon: Icon(
            _isPasswordVisible ? Icons.visibility_off : Icons.visibility,
            color: const Color(0xFF8B5CF6),
          ),
          onPressed: () {
            setState(() {
              _isPasswordVisible = !_isPasswordVisible;
            });
          },
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF8B5CF6), width: 2),
        ),
        filled: true,
        fillColor: const Color(0xFFF9FAFB),
      ),
    );
  }

  Widget _buildSocialButton(IconData icon, Color color) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: IconButton(
        icon: Icon(icon, color: color, size: 24),
        onPressed: () {
          // TODO: Handle social login
        },
      ),
    );
  }
}
