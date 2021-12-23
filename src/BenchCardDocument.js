import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "col",
    backgroundColor: "#E4E4E4"
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

export default ({ plant, region, waterUseByCode }) => {
    const p = plant;
    const imageSize = '64px';
    let wu = waterUseByCode[p.waterUseByRegion[region-1]];
    //let photoUrl = !photosByPlantName[p.botanicalName] ? "https://via.placeholder.com/200" : photosByPlantName[p.botanicalName].small.url;
    return (
        <Document>
            <Page size="A4" style={styles.page}>
            <View style={{ fontSize: "100px" }}>
                <Text>{plant.botanicalName}</Text>
                <Text>{plant.commonName}</Text>
            </View>
            <View style={styles.section}>
                <Text>Section #1</Text>
            </View>
            <View style={styles.section}>
                <Text>Section #2</Text>
            </View>
            </Page>
        </Document>
    );
}