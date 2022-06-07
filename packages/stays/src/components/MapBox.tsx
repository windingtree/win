import type { Map, LatLngExpression } from "leaflet";
import { Box } from "grommet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import Logger from "../utils/logger";

const logger = Logger('MapBox');
const defaultZoom = 13

const MapSettings: React.FC<{
  center: LatLngExpression;
  map: Map;
}> = ({ map, center }) => {
  const [position, setPosition] = useState(() => map.getCenter())
  const [zoom, setZoom] = useState(() => map.getZoom())

  const onMove = useCallback(() => {
    setPosition(map.getCenter())
  }, [map])

  const onZoom = useCallback(() => {
    setZoom(map.getZoom())
  }, [map])

  useEffect(() => {
    map.on('move', onMove)
    return () => {
      map.off('move', onMove)
    }
  }, [map, onMove])

  useEffect(() => {
    map.on('zoom', onZoom)
    return () => {
      map.off('zoom', onZoom)
    }
  }, [map, onZoom])

  useEffect(() => {
    logger.debug('onMove', center);
    map.setView(center, defaultZoom);
  }, [map, center])

  useEffect(() => {
    logger.debug('onZoom', zoom);
    map.setZoom(zoom);
  }, [zoom, map])

  useEffect(() => {
    logger.debug(`latitude: ${position.lat.toFixed(4)}, longitude: ${position.lng.toFixed(4)}`);
  }, [position])

  useEffect(() => {
    logger.debug(`zoom: ${zoom}`);
  }, [zoom])

  return null
}

export const MapBox: React.FC<{
  center: LatLngExpression
}> = ({ center }) => {
  const [map, setMap] = useState<Map | null>(null)

  const displayMap = useMemo(
    () => (
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{
          height: "70vh",
          // width: "100vw"
        }}
        scrollWheelZoom={false}
        ref={setMap}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    ),
    [center],
  )

  return (
    <Box>
      {map ? <MapSettings center={center} map={map} /> : null}
      {displayMap}
    </Box>
  )
};
