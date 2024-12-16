// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bike.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Bike _$BikeFromJson(Map<String, dynamic> json) => Bike(
      location: json['location'] as List<dynamic>,
      status: Status.fromJson(json['status'] as Map<String, dynamic>),
      cityName: json['city_name'] as String? ?? 'Okänd',
    );

Map<String, dynamic> _$BikeToJson(Bike instance) => <String, dynamic>{
      'location': instance.location,
      'status': instance.status.toJson(),
      'city_name': instance.cityName,
    };
