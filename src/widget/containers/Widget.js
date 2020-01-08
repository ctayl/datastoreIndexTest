/* eslint-disable no-underscore-dangle */
import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react'

export class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dsProvider: 'publicData',
      method: 'search',
      string1: null,
      number1: null,
      date1: null,
      text: null,
      data: {},
      identifier: null,
      url: null,
      testUrl: null
    };
  }


  execute = () => {
    const {
      dsProvider, string1, number1, date1, text, method, identifier
    } = this.state;

    const options = {
      data: { identifier, key: Math.floor(Math.random() * 1e5), updateCount: 0 },
      filter: {}
    };

    if (method === 'search' || method === 'searchAndUpdate') {
      if (text) {
        options.$text = { $search: text };
      }
      if (string1) {
        options.filter['_buildfire.index.string1'] = string1;
      }
      if (number1) {
        options.filter['_buildfire.index.number1'] = number1;
      }
      if (date1) {
        options.filter['_buildfire.index.date1'] = date1;
      }
    }

    if (method === 'insert') {
      options._buildfire = {
        index: {
          string1, number1, date1, text
        }
      };
    }

    if (method === 'searchAndUpdate') {
      delete options.data;
      if (text) {
        options.filter.$text = { $search: text };
      }

      if (Object.keys(options.filter) < 1) {
        options.filter = { 'data.identifier': identifier };
      }
      if (dsProvider === 'userData') {
        return window.buildfire.auth.getCurrentUser((e, user) => {
          const { _id } = user;

          return window.buildfire[dsProvider][method](options.filter, { $inc: { "data.updateCount": 1 } }, 'primary', _id, (err, data) => {
            if (err) throw err;
            this.setState(() => ({ data }));
          });
        });
      }
      return window.buildfire[dsProvider][method](options.filter, { $inc: { "data.updateCount": 1 } }, 'primary', (err, data) => {
        if (err) throw err;
        this.setState(() => ({ data }));
      });
    }

    window.buildfire[dsProvider][method](options, 'primary', (err, data) => {
      if (err) throw err;
      if (data && !data.length) {
        data = [data];
      }
      this.setState(() => ({ data }));
    });
  }

  clearProvider = () => {
    const { dsProvider } = this.state;
    window.buildfire[dsProvider].search({}, 'primary', (err, results) => {
      window.buildfire.auth.getCurrentUser((e, { _id }) => {
        results.forEach((result) => {
          if (dsProvider === 'userData') {
            return window.buildfire.userData.delete(result.id, 'primary', _id, console.log);
          }
          window.buildfire[dsProvider].delete(result.id, 'primary', console.log);
        });
      });
    });
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;

    this.setState(() => ({ [name]: value }));
  }

  componentDidUpdate = () => console.warn(this.state)

  render() {
    const { data, url, testUrl } = this.state;
    return (
      <div className="container">
        <div className="row">
          <select name="dsProvider" onChange={this.handleInputChange}>
            <option value="publicData" selected>publicData</option>
            <option value="appData">appData</option>
            <option value="userData">userData</option>
          </select>
        </div>
        <div className="row">
          <select name="method" onChange={this.handleInputChange}>
            <option value="search" selected>search</option>
            <option value="insert">insert</option>
            <option value="searchAndUpdate">searchAndUpdate</option>
          </select>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <label htmlFor="text">text</label><input type="text" name="text" onChange={this.handleInputChange} />
          </div>
          <div className="col-xs-12">
            <label htmlFor="string1">string1</label><input type="text" name="string1" onChange={this.handleInputChange} />
          </div>
          <div className="col-xs-12">
            <label htmlFor="number1">number1</label><input type="number" name="number1" onChange={this.handleInputChange} />
          </div>
          <div className="col-xs-12">
            <label htmlFor="date1">date1</label><input type="date" name="date1" onChange={this.handleInputChange} />
          </div>
          <div className="col-xs-12">
            <label htmlFor="identifier">identifier</label><input type="text" name="identifier" onChange={this.handleInputChange} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <button type="button" onClick={this.execute}>Execute</button>
            <button type="button" onClick={() => this.setState({ data: {} })}>Clear Logs</button>
            <button type="button" onClick={this.clearProvider}>Clear Selected Provider</button>
            <button type="button" onClick={() => window.buildfire.auth.login({}, console.log)}>Login</button>
            <button type="button" onClick={() => window.buildfire.auth.logout({}, console.log)}>Logout</button>
          </div>
        </div>
        <div className="row">
          <div>{
            data && data.length && data.map((record) => {
              if (!record.data) {
                return JSON.stringify(record);
              }
              return (
                <div className="well" style={{ 'padding': '5px' }}>
                  <p>identifier: {record.data.data.identifier}</p>
                  <p>updateCount: : {record.data.data.updateCount}</p>
                  {record.data._buildfire.index.text ? <p>text: {record.data._buildfire.index.text}</p> : null}
                  {record.data._buildfire.index.string1 ? <p>string1: {record.data._buildfire.index.string1}</p> : null}
                  {record.data._buildfire.index.number1 ? <p>number1: {record.data._buildfire.index.number1}</p> : null}
                  {record.data._buildfire.index.date1 ? <p>date1: {record.data._buildfire.index.date1}</p> : null}
                </div>
              );
            })
          }
            {
              data && !data.length ? JSON.stringify(data) : null
            }
          </div>
        </div>

        <div className="row">
          <label htmlFor="url">URL</label><input name="url" type="text" onChange={this.handleInputChange} />
          <button type="button" onClick={() => this.setState({ testUrl: url })}>Test Url</button>

          <code style={{ 'overflow': 'scroll' }}>
            {testUrl && buildfire.imageLib.cropImage(testUrl, { width: 100, height: 100 })}
          </code>
        </div>
      </div>
    );
  }
}


export default hot(Widget);
