import 'package:json_annotation/json_annotation.dart';
import 'status.dart';

part 'bike.g.dart';

// Converts json object Bike to dart object Bike

@JsonSerializable(explicitToJson: true)
class Bike {
  final List location;
  final Status status;

  @JsonKey(name: 'city_name', defaultValue: 'Okänd')
  final String cityName;

  const Bike(
      {required this.location, required this.status, required this.cityName});

  factory Bike.fromJson(Map<String, dynamic> json) => _$BikeFromJson(json);

  Map<String, dynamic> toJson() => _$BikeToJson(this);

  @override
  String toString() =>
      'Bike{location: $location, status: $status, cityName: $cityName}';
}
