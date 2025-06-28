import { ReactNode } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
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

const dropRatingByWaterUseCode: { [key: string]: ReactNode } = (() => {
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

const WaterDropRating = ({ waterUseCode }: WaterDropRatingProps) => {
  const drops = dropRatingByWaterUseCode[waterUseCode];
  return drops ? (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        margin: "0 25%",
      }}
    >
      {drops}
    </View>
  ) : (
    <Text>N/A</Text>
  );
};

interface BenchCardDocumentProps {
  plant: Plant;
  region: number;
  waterUseByCode: { [key: string]: WaterUseClassification };
  benchCardTemplate: BenchCardTemplate;
  qrCodeDataUrl?: string;
}

const BenchCardDocument = ({
  plant,
  region,
  waterUseByCode,
  benchCardTemplate,
  qrCodeDataUrl,
}: BenchCardDocumentProps) => {
  const p = plant;
  // Only use the provided QR code data URL - don't fall back to sync method
  const qrCodeUrl = qrCodeDataUrl || '';
  
  // Debug QR code
  if (debug) {
    console.log('BenchCardDocument QR code debug:', {
      qrCodeDataUrl,
      qrCodeUrl,
      hasQrCode: !!qrCodeUrl,
      qrCodeLength: qrCodeUrl?.length
    });
  }
  
  let wuCode = p.waterUseByRegion[region - 1];
  let wu = waterUseByCode[wuCode];
  //console.log(region, wuCode, wu) //console.log(p)
  let leadPhoto = p.photos[0];
  let photoUrl = (!leadPhoto ? "" : leadPhoto.small.url).replace(
    "wucolsplants.sf.ucdavis.edu",
    "wucols-proxy.azurewebsites.net"
  );
  //console.log({ leadPhoto, photoUrl });
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
              <Image debug={debug} src={photoUrl} style={{ width: "30%" }} />
            )}

            <View
              debug={debug}
              style={[
                styles.waterUseClassificationBox,
                {
                  fontSize: `${sizeInches.x / 11 / 4}in`,
                  width: "50%",
                  minHeight: "100pt",
                  maxHeight: "150pt",
                },
              ]}
            >
              <Text
                style={{
                  color: "white",
                  paddingBottom: `${sizeInches.x / 11 / 8}in`,
                  fontSize: `${sizeInches.x / 11 / 6}in`,
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
                  padding: "3pt",
                }}
              >
                <Text style={{ fontSize: `${sizeInches.x / 11 / 4}in`, fontWeight: "bold" }}>{wu.name}</Text>
                <View style={{ fontSize: `${sizeInches.x / 11 / 2.2}in`, paddingVertical: "1pt" }}>
                  <WaterDropRating waterUseCode={wu.code} />
                </View>
                <View style={{ paddingVertical: "1pt" }}>
                  <Text style={{ fontSize: `${sizeInches.x / 11 / 4.5}in` }}>Central Valley</Text>
                  <Text style={{ fontSize: `${sizeInches.x / 11 / 5}in` }}>(WUCOLS Region 2)</Text>
                </View>
                <Text style={{ fontSize: `${sizeInches.x / 11 / 6}in` }}>(Source: WUCOLS IV)</Text>
              </View>
            </View>
            
            {/* Add QR code only if available - larger size for better scanning */}
            {qrCodeUrl && qrCodeUrl.length > 0 && (
              <View
                debug={debug}
                style={{
                  width: "20%",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  paddingTop: "8pt",
                }}
              >
                <Text style={{ fontSize: "10pt", marginBottom: "4pt", fontWeight: "bold" }}>
                  Scan for Details
                </Text>
                <Image 
                  debug={debug} 
                  src={qrCodeUrl} 
                  style={{ 
                    width: "90px",
                    height: "90px",
                    objectFit: 'contain'
                  }} 
                />
              </View>
            )}
          </View>
          <View
            debug={debug}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
              padding: "12pt",
              margin: "30pt",
            }}
          >
            <Image debug={debug} src="/logo-dwr.png" style={logoStyle} />
            <Image debug={debug} src="/logo-ucd-ccuh.png" style={logoStyle} />
            <Image debug={debug} src="/logo-ucanr.png" style={logoStyle} />
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
