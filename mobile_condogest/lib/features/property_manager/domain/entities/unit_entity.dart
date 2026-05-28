class Unit {
  final String id;
  final int number;
  final int floor;
  final String? block;
  final String? userId;

  Unit({
    required this.id,
    required this.number,
    required this.floor,
    this.block,
    this.userId,
  });
}
