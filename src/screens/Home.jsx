
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Headline,
  Text,
  Dialog,
  Portal,
  Paragraph,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { getEventsGuard } from "../state/eventsGuard";
import Moment from "moment";
import * as Location from "expo-location"
import { sendReportArrive } from "../state/reports";
import AppBar from "./AppBar";
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({navigation}) => {

  const user = useSelector((state) => state.user);
  const events = useSelector((state) => state.eventsGuard);
  
  const date = new Date();
  const hoy = Moment(date).format("YYYY-MM-DD");

  const actualEvent = events?.find((event) => event.start.split("T")[0] === hoy || event.end.split("T")[0] === hoy);

  const dispatch = useDispatch();

  const[internet,setInternet] = useState(true);

/*   const unsubscribe = NetInfo.addEventListener(state => {
    console.log('Is connected?', state.isConnected);
  }); */

  NetInfo.fetch().then(state => {
    console.log("Connection type", state.type);
    console.log("Is connected?", state.isConnected);
    setInternet(state.isConnected);
  });

  console.log("INTERNET",internet);


  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('dataReport', jsonValue)
    } catch (e) {
      // saving error
    }
  }

  const [reports, setReports] = useState([]);
  console.log("REPORTS", reports);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('dataReport')
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      return e
    }
  }
  

  useEffect(() => {
    dispatch(getEventsGuard(user.id))
  }, [dispatch]);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
  }

  getCurrentLocation()

  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();


  const [value, setValue] = useState(false);

  const [visible, setVisible] = React.useState(false);

  const hideDialog = () => setVisible(false);

  //cuando vuelve internet se envia el reporte

  useEffect(() => {
    if(internet){
      reports.map((report) => {
        dispatch(sendReportArrive(report))
      })
      setReports([])
      storeData([])
    }
  }, [internet]);


  const onSubmit = async () => {
    const data = {
      hour:  Moment(date).utcOffset("-03:00").format("DD/MM/YYYY HH:mm"),
      latitude,
      longitude,
      securityGuardId: user.id,
      branchOfficeId: actualEvent?.branchofficeId
    }
    if(internet){
      const response = await dispatch(sendReportArrive(data));
    } else {
     
      storeData(data);
      const prueba = getData().then((value) => {
        reports.push(value)
        return value
      });
    }

    if (value === false) {
      setValue(true);
    } else {
      setValue(false);
    }
    //sendInfo()
    hideDialog();
  }
  


  return (
    <>
      <View style={styles.container}>
        <AppBar navigation={navigation}/>
        <Headline style={{textAlign:"center", marginTop:30}}>Bienvenid@ {user.name} {user.lastname}</Headline>
        {value === false ? (
          <Button // disabled={!isDirty || !isValid}
            style={{ marginTop: 25, width: "50%", alignSelf: "center" }}
            color="green"
            mode="contained"
            title="Submit"
            // onPress={handleSubmit(onSubmit)}
            onPress={() => setVisible(true)}
          >
            Llegué
          </Button>
        ) : (
          <Button // disabled={!isDirty || !isValid}
            style={{ marginTop: 25, width: "50%", alignSelf: "center" }}
            color="red"
            mode="contained"
            title="Submit"
            // onPress={handleSubmit(onSubmit)}
            onPress={() => setVisible(true)}
          >
            Me voy
          </Button>
        )}
      </View>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Content>
            <Paragraph>
              ¿Estás seguro de realizar la siguiente acción?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancelar</Button>
            <Button
              onPress={onSubmit}
            >
              Ok
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    marginTop:50,
  },
});

export default Home;
