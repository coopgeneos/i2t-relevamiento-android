import { StyleSheet } from "react-native"

export default StyleSheet.create({

  container : {
    color: '#F08377',
    fontSize: 25,
    alignContent: 'center',
    backgroundColor: '#534D64'
  },
  header : {
    color: '#F08377',
    fontSize: 25,
    alignContent: 'center',
    backgroundColor: '#534D64'
  },
  homeContainerIcons: {
    flex: 1, 
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignContent: 'center',
    alignItems: 'center'
  },
  homeButton: {
    marginLeft: '15%',
    width: '35%',
    height: '35%'
  },
  homeButtonIcons: {
    fontSize: 120
  },

  listContainer: {
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  list: {
    width: '80%', 
    borderWidth: 1,
  },
  listItem: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listHeaderText: {
    fontSize: 20
  },

  bottomButtons: {
    //flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end'
  },

  dataTableContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
     width: '70%'
  },
  headerCellText : {
    color: 'white',
    fontSize: 15
  },
  cellText : {
    fontSize: 15,
    textAlign: 'center'
  },
})