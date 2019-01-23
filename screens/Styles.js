import { StyleSheet } from "react-native"

export default StyleSheet.create({
  header : {
    color: 'white',
    fontSize: 30,
    alignContent: 'center'
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
    //flex: 2,
    width: '50%',
    height: '50%'
  },
  homeButtonIcons: {
    fontSize: 150
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
    alignContent: 'center'
  },
  dataTable: {
    width: '80%',
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