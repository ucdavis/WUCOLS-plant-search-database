import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";
import {plantDetailQrCodeFromId} from './PlantDetailQrCode';

const debug=false;

// Create styles
const styles = StyleSheet.create({
  page: {
      textAlign:'center',
    backgroundColor: "white"
  },
  logo: {

  },
  logos: {

  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});


const dropRatingByWaterUseCode = (() => {
Font.register({family:'FontAwesome',src:'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.2.0/fonts/fontawesome-webfont.ttf'})
  const DropIcon = ({filled}) => 
<Text style={{opacity:filled ? 1 : 0.3, color: filled ? '#007bff' : 'grey', fontFamily:'FontAwesome'}}>
    
</Text>;
    
/*
    <Image src="/water-drop.svg" style={{opacity:filled ? 1 : 0.4}} />;
*/

  let d = <DropIcon />; 
  let D = <DropIcon filled={true} />;
  //let d = <span role="img" aria-label="empty-water-drop" style={{opacity:0.3}}>💧</span>;
  //let D = <span role="img" aria-label="full-water-drop">💧</span>;
  return {
    '?': <>{d}{d}{d}{d}</>,
    'N': <>{d}{d}{d}{d}</>,
    'VL': <>{D}{d}{d}{d}</>,
    'LO': <>{D}{D}{d}{d}</>,
    'M':  <>{D}{D}{D}{d}</>,
    'H':  <>{D}{D}{D}{D}</>
  };
})();

const WaterDropRating = ({waterUseCode}) =>
  <View style={{display:'flex', flexDirection:'row',justifyContent:'space-evenly', margin: '0 25%'}}>
      {dropRatingByWaterUseCode[waterUseCode]}
    </View> || <>N/A</>;

const BenchCardDocument = ({ plant, region, waterUseByCode }) => {
    const p = plant;
    const qrCodeUrl = plantDetailQrCodeFromId(plant.id).image_url;
    let wuCode = p.waterUseByRegion[region-1];
    let wu = waterUseByCode[wuCode];
    //console.log(wu)
    //console.log(p)
    let photoUrl = !p.botanicalName.length ? "https://via.placeholder.com/800" : p.photos[0].large.url;
    return (
        <Document debug={debug}>
            <Page size={[11 * 72, 7 * 72]} style={styles.page}>
            <View debug={debug} style={{
                display: 'flex',
                height:'100%',
                flexDirection: 'col',
                justifyContent:'space-evenly'
            }}>
                <View>
                    <Text debug={debug} style={{ fontSize: "40pt", fontWeight:'extrabold' }}>
                        {plant.botanicalName}
                    </Text>
                    <Text debug={debug} style={{ fontSize: "30pt", fontWeight:'normal',fontStyle:'italic' }}>
                        {plant.commonName}
                    </Text>
                </View>
                <View debug={debug} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    margin:'18pt',
                    justifyContent:'space-around'
                }}>
                    <Image debug={debug} src={photoUrl} style={{width:'45%'}}/>
                    <View debug={debug} style={{
                        backgroundColor: '#304972',
                        padding:'9pt',
                        width:'45%',
                        textAlign:'center'
                    }}>
                        <Text style={{color:'white', paddingBottom:'9pt'}}>Water Use Classification</Text>
                        <View style={{backgroundColor:'white', flexGrow:'1',
                            display: 'flex',
                            flexDirection: 'col',
                            justifyContent:'space-evenly'
                        }}>
                            <Text style={{
                                fontSize:'22pt'
                            }}>{wu.name}</Text>
                            <View style={{ fontSize:'40pt' }}>
                                <WaterDropRating waterUseCode={wu.code}/>
                            </View>
                            <View>
                                <Text>Central Valley</Text>
                                <Text>(WUCOLS Region 2)</Text>
                            </View>
                            <Text>(Source: WUCOLS IV)</Text>
                        </View>
                    </View>
                </View>
                <View debug={debug} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent:'space-evenly',
                    alignItems: 'center',
                    margin: '2em'
                }}>
                    <Image debug={debug} src="/logo-dwr.png" style={{height: "90px", width:'auto'}}/>
                    <Image debug={debug} src="/logo-ucd-ccuh.png" style={{height: "80px", width:'auto'}}/>
                    <Image debug={debug} src="/logo-ucanr.png" style={{height: "80px", width:'auto'}}/>
                    <Image debug={debug} src={qrCodeUrl} style={{height: "80px", width:'auto'}}/>
                </View>
            </View>
            </Page>
        </Document>
    );
};

export default BenchCardDocument;