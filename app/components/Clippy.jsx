// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ipcRenderer, clipboard } from 'electron';
import FontAwesome from 'react-fontawesome';
import styles from './Clippy.css';
import MiscUtil from '../utils/Util';
import routes from '../constants/routes.json';


export default class Clippy extends Component {


  constructor(props) {
    super(props);
    this.util = new MiscUtil();
  }

  state = {
    clipArray: []
  };

  componentDidMount() {
    // Initial data load from database this runs only once when the app starts
    /* eslint-disable */

    const args = this.props.getAllData(25);
    const copyArray = [];

    args.map((name, index) => copyArray.push(args[index].data));
    console.log("componentDidMount ran!")
    this.setState(() => ({
      clipArray: copyArray
    }));
  }

  componentDidUpdate() {
    console.log("componentDidUpdate ran!")
    ipcRenderer.once('db-ch', (event, args) => {
      const date = new Date();

      const { clipArray } = this.state;

      if (!clipArray.includes(args.toString())) {
        // Dont add the data to the db if its already there
        /* eslint-disable */
        
        this.props.insertData(args, date.toString());
      }

      this.setState(prevState => {
        const removeDupes = this.util.removeDuplicates([
          args,
          ...prevState.clipArray
        ]);

        return { clipArray: removeDupes };
      });
    });
  }

  componentWillUnmount(){
    console.log("componentWillUnmount ran!");
  }

  cutArray = e => {
    const content = e.target.textContent.toString();
    clipboard.writeText(content);
  };

  render() {

    /* eslint-disable */
    // Add a unique key creator for the key
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          Recent Copies
          <Link className={styles.settingsLink} to={routes.SETTINGS}>
            <FontAwesome name="cog" />
          </Link>
        </div>
        <div className={styles.copyList}>
          <ul>
            {this.state.clipArray.map((name, index) => (
              <div className={styles.listItemContainer} key={index}>
                <li
                  className={styles.copies}
                  onClick={this.cutArray}
                  arrayindex={index}
                >
                  {name}
                </li>
              </div>
            ))}
          </ul>
        </div>

        <div className={styles.footer} />
      </div>
    );
  }
}
