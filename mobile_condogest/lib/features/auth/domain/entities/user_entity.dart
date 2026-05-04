enum UserRole { admin, liquidator, resident, user }

class UserAuth {
  final String id;
  final String name;
  final String email;
  final UserRole type;
  final String token;

  const UserAuth({
    required this.id,
    required this.name,
    required this.email,
    required this.type,
    required this.token,
  });
}
