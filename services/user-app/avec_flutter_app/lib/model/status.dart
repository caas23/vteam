import 'package:json_annotation/json_annotation.dart';

part 'status.g.dart';

// Converts the status part of jsonobject Bike to a seperate Dartobject Status

@JsonSerializable()
class Status {
  @JsonKey(defaultValue: false)
  final bool available;

  const Status({required this.available});

  factory Status.fromJson(Map<String, dynamic> json) => _$StatusFromJson(json);

  Map<String, dynamic> toJson() => _$StatusToJson(this);

  @override
  String toString() => 'Status{available: $available}';
}
