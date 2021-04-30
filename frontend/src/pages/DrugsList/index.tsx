import React, { Fragment, useEffect, useState, PureComponent, Component } from 'react';
import Table from '@bostongene/frontend-components/Table';
import Checkbox from '@bostongene/frontend-components/Checkbox';
import Radio from '@bostongene/frontend-components/Radio'
import Pagination from '@bostongene/frontend-components/Pagination'
import Button from '@bostongene/frontend-components/Button';
import Select, { ISelectTarget } from '@bostongene/frontend-components/Select';
import { Link } from 'react-router-dom';
import axios from 'axios'
import { render } from 'enzyme';
import { History, LocationState } from 'history';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import './index.scss';
import Experimental from 'pages/Experimental';
import queryString from 'query-string';
import _isEqual from 'lodash/isEqual';


interface ISourceSelectProps {
  history: History<LocationState>;
}

class NctDrugsList extends PureComponent
<ISourceSelectProps>
  {
    state = {
      source: "nct",
      batch: "",
      isLoaded: false,
      candidates: [],
      batches: [],
      sourceHistory: "",
      // selectedBatchId: "",
      isCheckedList: [],
      isChecked: false,
      multipleDrugStatus: "",
      batchProgress: "",
      //scrollPosition: 0,
      showProcessedBatches: false,
    }    

  //   onSourceChange = ({ name, value }: ISelectTarget) => {
  //     this.setState({ [name]: value } );
  //     const { history } = this.props;
  //     // console.log(history)
  //       if (value === 'abstract') {
  //         axios.get(`/candidates?source=${value}`).then((({data}) => this.setState({candidates: data.candidates.slice(0,100), isNCT: false, isChoosen: true, sourceHistory: history.location.search, batch: ""})))
  //         history.replace(
  //         `/?source=${value}`
  //         )
  // } else {
  //       axios.get(`/candidates?source=${value}`).then((({data}) => this.setState({candidates: data.candidates.slice(1500,2000), isNCT: true, isChoosen: true, sourceHistory: history.location.search})))
  //       history.replace(
  //         `/?source=${value}`
  //         )
  //       }
  //       const {
  //         source,
  //       } = queryString.parse(history.location.search, {
  //         parseNumbers: true
  //       })
  //       // console.log(source)
  //       // this.setState({ source: source },
  //         //  () => console.log(this.state)
  //           // );
  //     };

  onProcessedBatchCheckedChange  = ({ name, value }: ISelectTarget) => {
    axios.get(`/batches?source=${this.state.source}&showProcessed=${!this.state.showProcessedBatches}`).then((({data}) => this.setState({batches: data.batches, showProcessedBatches: !this.state.showProcessedBatches}, () => console.log(this.state.showProcessedBatches))))
  };


  onCheckedChange = ({ candidateId }) =>
  {
    const {isCheckedList} = this.state;
    const newCheckedList = isCheckedList.includes(candidateId) ? isCheckedList.filter(id => id !== candidateId) : [...isCheckedList, candidateId];
    this.setState({isCheckedList: newCheckedList, isChecked: true})
  }

  changeCharactetistics = ({ value }: ISelectTarget) => {
    this.setState({ multipleDrugStatus : value }, (() => console.log(this.state.multipleDrugStatus)))
  };


  applyStatus = () => {
    const { history } = this.props;
    console.log(this.state.isCheckedList, this.state.multipleDrugStatus)
        // axios.put('/multiple_update', {
        //   drugList: this.state.isCheckedList,
        //   drugStatus: this.state.multipleDrugStatus
        // })
        axios.put('/multiple_update',  {
          drugList: this.state.isCheckedList,
          drugStatus: this.state.multipleDrugStatus
        }).then(response => {
          axios.get(`/candidates?source=${this.state.source}&batchId=${this.state.batch}`).then((({data}) => this.setState(
            {candidates: data.candidates, multipleDrugStatus : "", isCheckedList: [], isLoaded: true}, (() =>console.log(this.state)))));
            }).then(response => {
              axios.get(`/batches/${this.state.batch}?source=${this.state.source}`).then((({data}) => this.setState({batchProgress: data.batch_fill})));
            }).then(response => {
              axios.get(`/batches?source=${this.state.source}`).then((({data}) => this.setState({batches: data.batches}, () => {console.log(this.state.batches)})))
            })
      
        // this.setState({ multipleDrugStatus : "", isCheckedList: []})
        // axios.get(`/candidates?source=nct&batchId=${this.state.batch}`).then((({data}) => this.setState(
        //   {candidates: data.candidates, multipleDrugStatus : "", isCheckedList: [], isLoaded: true}, (() =>console.log(this.state)))))
      }
      
  onBatchChange = ({ name, value }: ISelectTarget) => {
      const { history } = this.props;
      const {sourceHistory} = this.state
      this.setState({ [name]: value } );
      this.setState({candidates: []})
      axios.get(`/candidates?source=nct&batchId=${value}`).then((({data}) => this.setState({candidates: data.candidates, isLoaded: true})))
      axios.get(`/batches/${value}?source=${this.state.source}`).then((({data}) => this.setState({batchProgress: data.batch_fill})));
      history.replace(`/nct?batch=${value}`)
    };

  
    handleScrollPosition = () => {
      const scrollPosition = sessionStorage.getItem("scrollPosition");
      // if (scrollPosition) {
        console.log(scrollPosition)
        window.scrollTo(123, 232);
        sessionStorage.removeItem("scrollPosition");
        console.log('done')
      // }
    };

    handleClick = e => {
      sessionStorage.setItem("scrollPosition", window.pageYOffset.toString());
      // console.log(window.pageYOffset)
      // console.log('done')
    };
  

  componentDidMount(){
    const { history } = this.props;
     const {
      batch = "",
    } = queryString.parse(history.location.search, {
      parseNumbers: true,
    })
    if (batch !== "") {
      this.setState(
        { batch: batch },      
        () => axios.get(`/candidates?source=${this.state.source}&batchId=${this.state.batch}`).then((({data}) => this.setState({candidates: data.candidates, isLoaded: true})))
        );
    axios.get(`/batches/${batch}?source=nct`).then((({data}) => this.setState({batchProgress: data.batch_fill})));
      // axios.get(`/candidates?source=${this.state.source}&batchId=${this.state.batch}`).then(res => {
      // this.setState({candidates: data.candidates, isLoaded: true, batch : batch}, () => {
      //   this.handleScrollPosition();
      // });
    // });
    }
    else {
      // this.setState({ batch: batch },      
      //   () => axios.get(`/candidates?source=${this.state.source}`).then((({data}) => this.setState({candidates: data.candidates, isLoaded: true })))
      //   ); 
      // this.setState({ batch: batch },      
      //   () => axios.get(`/sources/${this.state.source}`).then(({data}) => 
      //   axios.get(`/${data.link_latest_candidates}`).then((({data}) => this.setState({candidates: data.candidates, isLoaded: true })))
      //   )); 
  axios.get(`/sources/${this.state.source}`).then(response => {
    axios.get(`${response.data.link_latest_unprocessed_candidates}`).then((({data}) => this.setState({candidates: data.candidates, isLoaded: true}, () => {  console.log(this.state)    })));
      })
  axios.get(`/sources/${this.state.source}`).then(response => {
    axios.get(`${response.data.link_latest_unprocessed_batch}`).then((({data}) => this.setState({batch: data.id, batchProgress: data.batch_fill})));
  })
   } 
  axios.get(`/batches?source=${this.state.source}`).then((({data}) => this.setState({batches: data.batches}, () => {this.handleScrollPosition()})))

}


//    componentDidUpdate(prevProps, prevState){
//      const {history} = this.props
//      if (!_isEqual(prevState, this.state)) {
//       console.log("update")
//           if ((typeof this.state.batch !== 'undefined') && (this.state.batch !== "")) {
//             console.log("batch")
//             axios.get(`/candidates?source=${this.state.source}&batchId=${this.state.batch}`).then((({data}) => this.setState({candidates: data.candidates.slice(1500,2000), sourceHistory: history.location.search})))
//             history.replace(
//               `/${this.state.source}?batch=${this.state.batch}`
//               )
//         }
//         else {
//           axios.get(`/candidates?source=nct`).then((({data}) => this.setState({candidates: data.candidates.slice(0,100)})))
//           history.replace(
//             `/${this.state.source}`)
//           }
//         }
// }
  render() {
    
    const {candidates, isLoaded, batches, batch, isChecked, multipleDrugStatus, isCheckedList, batchProgress} = this.state
    const drugSource = this.state.source
    return isLoaded &&
    <Fragment>
      <div>
        {/* <Experimental d = {drugSource}/> */}
      </div>
      <div className="main_label">
      <h1 >Table of possible candidates</h1>
      <div>
      </div>

      </div>
      {/* <div className="drugs-list-filters__label_1">Source
      <div>
          <Select
            name="source"
            options={[
              { label: 'NCT', value: 'nct' },
              { label: 'Abstracts', value: 'abstract' },
            ]}
            value={source}
            onChange={({ name, value }) => this.onSourceChange({ name, value })}  
          />
        </div>
        </div> */}
        <div className="drugs-list-filters__label_2">Select batch
          <div>
            <Select
              name="batch"
              className="drugs-list-filters__select"
              options={
                batches.map(({id, label, batch_fill}) => ({ value: id, label: label.concat(' ', batch_fill) }))
              }
              value={batch}
              onChange={({ name, value }) => this.onBatchChange({ name, value })}
            />
            </div>
          </div> 
          <div>
            {
            isChecked && 
            <div className="flag_box">
            <div>
            <Radio
              name="flagRadio"
              value="tp"
              label="TP"
              checked={multipleDrugStatus === "tp"}
              onChange={this.changeCharactetistics}
              />
            </div>
            <div>
              <Radio
                name="flagRadio"
                value="fp"
                label="FP"
                checked={multipleDrugStatus === "fp"}
                onChange={this.changeCharactetistics}
              />
            </div>
            <div>
              <Radio
                name="flagRadio"
                label="Black List"
                value="blackList"
                checked={multipleDrugStatus === "blackList"}
                onChange={this.changeCharactetistics}
              />
            </div>
            <div>
              <Radio
                name="flagRadio"
                label="No flag"
                value="none"
                checked={multipleDrugStatus === "none"}
                onChange={this.changeCharactetistics}
              />
            </div>
            <Button onClick = {() => this.applyStatus()} className="bg-button--primary">Apply</Button>
            </div>
            }
          </div>
          <div className="batch-status-checkbox">
              <div>
                  <Checkbox
                    name="batchStatusCheckbox"
                    label="Show processed batches"
                    value=""
                    checked={this.state.showProcessedBatches}
                    onChange={({ value }) => this.onProcessedBatchCheckedChange({ value })}
                    // onChange={this.onCheckedChange(candidate)}
                  />
              </div>
          </div>
          <div className="drug_table">
          <Table
            items={candidates}          
            schema={[
              {
                name: '',
                template: ({ candidate, candidateId }) => (
              <div>
                  <Checkbox
                    name="flagCheckbox"
                    label=""
                    value=""
                    checked={isCheckedList.includes(candidateId)}
                    onChange={({}) => this.onCheckedChange({ candidateId })}
                    // onChange={this.onCheckedChange(candidate)}
                  />
                </div>
                 ),
                className: 'col-xs-1',
                // headerTemplate: field => (
                //   <div>
                //     {field.name} <Tooltip label={field.name} tooltipText="possible Candidate name" />
                //   </div>
                // )
              },
              {
                name: 'candidate',
                template: ({ candidate, candidateId }) => (
                  <div>
                    <Link to={`/drugs/${candidateId}`}
                    onClick = {() => this.handleClick({})}>
                      {candidate}</Link>
                  </div>
                ),
                className: 'col-xs-2',
                // headerTemplate: field => (
                //   <div>
                //     {field.name} <Tooltip label={field.name} tooltipText="possible Candidate name" />
                //   </div>
                // )
              },
              {
                name: 'flag',
                template: ({ flag }) => (
                  <div>
                    <div>{flag}</div>
                  </div>
                ),
                className: 'col-xs-1',
                // headerTemplate: field => (
                //   <div>
                //     {field.name}{' '}
                //     <Tooltip
                //       label="Flag"
                //       tooltipText="A flag that shows if the drug either TP, FP, black_list or without a flag"
                //     />{' '}
                //   </div>
                // )
              },
              {
                name: 'NCT count',
                template: ({ nctCount }) => <div>{nctCount}</div>,
                className: 'col-xs-2',
                // headerTemplate: field => (
                //   <div>
                //     {field.name}{' '}
                //     <Tooltip
                //       label="NCT count"
                //       tooltipText="Number of NCTs where candidate was found "
                //     />{' '}
                //   </div>
                // )
              },
              {
                name: 'Found in Avicenna count',
                template: ({ avicennaCount }) => <div>{avicennaCount}</div>,
                className: 'col-xs-2',
                // headerTemplate: field => (
                //   <div>
                //     {field.name}{' '}
                //     {/* <Tooltip
                //       tooltipText={
                //         <div style={{ display: 'inline', alignItems: 'center' }}>
                //           <div
                //             style={{
                //               display: 'inline',
                //               justifyContent: 'center',
                //               alignItems: 'center',
                //               minWidth: '20px',
                //               minHeight: '20px',
                //               color: '#ffffff',
                //               borderRadius: '50%',
                //               marginRight: '8px'
                //             }}
                //           >
                //             1
                //           </div>
                //           <div>Number of matches in Avicenna drug dictionary</div>
                //         </div>
                //       }
                //     >
                //       Found in Avicenna count
                //     </Tooltip> */}
                //       <Tooltip label="Found in Avicenna count" tooltipText="Number of matches in Avicenna drug dictionary " />{' '}
                //   </div>
                // )
              },

              {
                name: 'Max Phase',
                template: ({ maxPhase }) => (
                  <div>
                    <div>{maxPhase}</div>
                  </div>
                ),
                className: 'col-xs-2',
                // headerTemplate: field => (
                //   <div>
                //     {field.name}{' '}
                //     <Tooltip label="Max Phase" tooltipText="Max phase which was found in all NCTs " />{' '}
                //   </div>
                // )
              },
              {
                name: 'Last FDA Label Date',
                template: ({ fdaLabelDate }) => (
                  <div>
                    <div>{fdaLabelDate}</div>
                  </div>
                ),
                className: 'col-xs-2',
                // headerTemplate: field => (
                //   <div>
                //     {field.name}{' '}
                //     <Tooltip
                //       label="Last FDA Label Date"
                //       tooltipText="The review date of the last FDA label"
                //     />{' '}
                //   </div>
                // )
              }
            ]}
            rowHeightSize="medium"
            itemKey="candidateId"
          />
          </div>
        </Fragment>
        
  // const [filterData, setFilterData] = useState({ maxDrugPhase: '' });
  // const [candidates, setCandidates] = useState([]);
  // const onFilterDataChange = (data: IFilterData) => setFilterData(data);
  // useEffect(() => {
  //   axios.get('/drugs-candidates?source=nci').then((({data}) => setCandidates(data.candidates)))
  // }, [candidates])

//   return (
//     <Fragment>
// <sourceFilter onFilterDataChange={onFilterDataChange} />
//       <Table
//         items={candidates}          
//         schema={[
//           {
//             name: '',
//             template: ({ candidate, candidateId }) => (
//               <div>
//                 <Link to={`/drugs/${candidateId}`}>{candidate}</Link>
//               </div>
//             ),
//             className: 'col-xs-2',
//             headerTemplate: field => (
//               <div>
//                 {field.name} <Tooltip label="canidate" tooltipText="possible Candidate name" />
//               </div>
//             )
//           },
//           {
//             name: '',
//             template: ({ flag }) => (
//               <div>
//                 <div>{flag}</div>
//               </div>
//             ),
//             className: 'col-xs-2',
//             headerTemplate: field => (
//               <div>
//                 {field.name}{' '}
//                 <Tooltip
//                   label="Flag"
//                   tooltipText="A flag that shows if the drug either TP, FP, black_list or without a flag"
//                 />{' '}
//               </div>
//             )
//           },
//           {
//             name: '',
//             template: ({ nctCount }) => <div>{nctCount}</div>,
//             className: 'col-xs-2',
//             headerTemplate: field => (
//               <div>
//                 {field.name}{' '}
//                 <Tooltip
//                   label="NCT count"
//                   tooltipText="Number of NCTs where candidate was found "
//                 />{' '}
//               </div>
//             )
//           },
//           {
//             name: '',
//             template: ({ avicennaCount }) => <div>{avicennaCount}</div>,
//             className: 'col-xs-2',
//             headerTemplate: field => (
//               <div>
//                 {field.name}{' '}
//                 {/* <Tooltip
//                   tooltipText={
//                     <div style={{ display: 'inline', alignItems: 'center' }}>
//                       <div
//                         style={{
//                           display: 'inline',
//                           justifyContent: 'center',
//                           alignItems: 'center',
//                           minWidth: '20px',
//                           minHeight: '20px',
//                           color: '#ffffff',
//                           borderRadius: '50%',
//                           marginRight: '8px'
//                         }}
//                       >
//                         1
//                       </div>
//                       <div>Number of matches in Avicenna drug dictionary</div>
//                     </div>
//                   }
//                 >
//                   Found in Avicenna count
//                 </Tooltip> */}
//                   <Tooltip label="Found in Avicenna count" tooltipText="Number of matches in Avicenna drug dictionary " />{' '}
//               </div>
//             )
//           },

//           {
//             name: '',
//             template: ({ maxPhase }) => (
//               <div>
//                 <div>{maxPhase}</div>
//               </div>
//             ),
//             className: 'col-xs-2',
//             headerTemplate: field => (
//               <div>
//                 {field.name}{' '}
//                 <Tooltip label="Max Phase" tooltipText="Max phase which was found in all NCTs " />{' '}
//               </div>
//             )
//           },
//           {
//             name: '',
//             template: ({ fdaLabelDate }) => (
//               <div>
//                 <div>{fdaLabelDate}</div>
//               </div>
//             ),
//             className: 'col-xs-2',
//             headerTemplate: field => (
//               <div>
//                 {field.name}{' '}
//                 <Tooltip
//                   label="Last FDA Label Date"
//                   tooltipText="The review date of the last FDA label"
//                 />{' '}
//               </div>
//             )
//           }
//         ]}
//         rowHeightSize="medium"
//       />
//     </Fragment>
//   );
// };
  }
}
export default NctDrugsList;
