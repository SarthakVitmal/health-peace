"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function Map({ lat, lng, psychiatrists }: any) {
  return (
    // @ts-ignore
    <MapContainer center={[lat, lng] as [number, number]} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]}>
        <Popup>You are here</Popup>
      </Marker>

      {psychiatrists.map((p: any) => (
        <Marker key={p._id} position={[p.location.coordinates[1], p.location.coordinates[0]]}>
          <Popup>{p.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
