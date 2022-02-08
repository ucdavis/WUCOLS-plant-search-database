import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { plantDetailQrCodeFromId } from "./PlantDetailQrCode";
import {
  BenchCardTemplate,
  Plant,
  WaterUseClassification,
  WaterUseCode,
} from "../types";

const debug = false;

// Create styles
const styles = StyleSheet.create({
  page: {
    textAlign: "center",
    backgroundColor: "white",
  },
  waterUseClassificationBox: {
    backgroundColor: "#304971",
    padding: "8pt",
    width: "44%",
    textAlign: "center",
  },
  logo: {},
  logos: {},
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const dropRatingByWaterUseCode: { [key: string]: JSX.Element } = (() => {
  Font.register({
    family: "FontAwesome",
    src: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.2.0/fonts/fontawesome-webfont.ttf",
  });
  const DropIcon = ({ filled }: { filled?: boolean }) => (
    <Text
      style={{
        opacity: filled ? 1 : 0.3,
        color: filled ? "#007bff" : "grey",
        fontFamily: "FontAwesome",
      }}
    >
      
    </Text>
  );

  /*
    <Image src="/water-drop.svg" style={{opacity:filled ? 1 : 0.4}} />;
*/

  let d = <DropIcon />;
  let D = <DropIcon filled={true} />;
  //let d = <span role="img" aria-label="empty-water-drop" style={{opacity:0.3}}>💧</span>;
  //let D = <span role="img" aria-label="full-water-drop">💧</span>;
  return {
    "?": (
      <>
        {d}
        {d}
        {d}
        {d}
      </>
    ),
    N: (
      <>
        {d}
        {d}
        {d}
        {d}
      </>
    ),
    VL: (
      <>
        {D}
        {d}
        {d}
        {d}
      </>
    ),
    LO: (
      <>
        {D}
        {D}
        {d}
        {d}
      </>
    ),
    M: (
      <>
        {D}
        {D}
        {D}
        {d}
      </>
    ),
    H: (
      <>
        {D}
        {D}
        {D}
        {D}
      </>
    ),
  };
})();

interface WaterDropRatingProps {
  waterUseCode: WaterUseCode;
}

const WaterDropRating = ({ waterUseCode }: WaterDropRatingProps) =>
  (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        margin: "0 25%",
      }}
    >
      {dropRatingByWaterUseCode[waterUseCode]}
    </View>
  ) || <>N/A</>;

interface BenchCardDocumentProps {
  plant: Plant;
  region: number;
  waterUseByCode: { [key: string]: WaterUseClassification };
  benchCardTemplate: BenchCardTemplate;
}

const BenchCardDocument = ({
  plant,
  region,
  waterUseByCode,
  benchCardTemplate,
}: BenchCardDocumentProps) => {
  const p = plant;
  const qrCodeUrl = plantDetailQrCodeFromId(plant.id).image_url;
  let wuCode = p.waterUseByRegion[region - 1];
  let wu = waterUseByCode[wuCode];
  //console.log(region, wuCode, wu) //console.log(p)
  let leadPhoto = p.photos[0];
  let photoUrl = !leadPhoto ? "" : leadPhoto.small.url;
  console.log({ leadPhoto, photoUrl });
  const sizeInches = benchCardTemplate.sizeInInches;
  const sizePoints = { x: sizeInches.x * 72, y: sizeInches.y * 72 };
  const logoStyle = { height: `${sizeInches.y / 5}in`, width: "auto" };
  return (
    <Document>
      <Page size={[sizePoints.x, sizePoints.y]} style={styles.page}>
        <View
          debug={debug}
          style={{
            display: "flex",
            height: "100%",
            padding: "18pt",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          <View>
            <Text
              debug={debug}
              style={{ fontSize: `${0.5}in`, fontWeight: "extrabold" }}
            >
              {plant.botanicalName}
            </Text>
            <Text
              debug={debug}
              style={{
                fontSize: "25pt",
                fontWeight: "normal",
                fontStyle: "italic",
                padding: "20pt",
              }}
            >
              {plant.commonName}
            </Text>
          </View>

          <View
            debug={debug}
            style={{
              display: "flex",
              flexDirection: "row",
              padding: `${sizeInches.x / 11 / 8}in`,
              justifyContent: "space-around",
            }}
          >
            {!!photoUrl && (
              <Image debug={debug} src={photoUrl} style={{ width: "45%" }} />
            )}

            <View
              debug={debug}
              style={[
                styles.waterUseClassificationBox,
                {
                  fontSize: `${sizeInches.x / 11 / 4}in`,
                },
              ]}
            >
              <Text
                style={{
                  color: "white",
                  paddingBottom: `${sizeInches.x / 11 / 8}in`,
                }}
              >
                Water Use Classification
              </Text>
              <View
                style={{
                  backgroundColor: "white",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                }}
              >
                <Text>{wu.name}</Text>
                <View style={{ fontSize: `${sizeInches.x / 11 / 2}in` }}>
                  <WaterDropRating waterUseCode={wu.code} />
                </View>
                <View>
                  <Text>Central Valley</Text>
                  <Text>(WUCOLS Region 2)</Text>
                </View>
                <Text>(Source: WUCOLS IV)</Text>
              </View>
            </View>
          </View>
          <View
            debug={debug}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
              padding: "2em",
              margin: "5em",
            }}
          >
            <Image debug={debug} src="/logo-dwr.png" style={logoStyle} />
            <Image debug={debug} src="/logo-ucd-ccuh.png" style={logoStyle} />
            <Image debug={debug} src="/logo-ucanr.png" style={logoStyle} />
            <Image debug={debug} src={qrCodeUrl} style={logoStyle} />
          </View>
        </View>
      </Page>
    </Document>
  );
};

BenchCardDocument.defaultProps = {
  benchCardTemplate: undefined,
};

export default BenchCardDocument;
