import React, { Fragment, useState, PureComponent } from 'react';
import Table from '@bostongene/frontend-components/Table';
import Checkbox from '@bostongene/frontend-components/Checkbox';
import Radio from '@bostongene/frontend-components/Radio';
import './Experimental.scss';
import axios from 'axios';
import Button from '@bostongene/frontend-components/Button';
import { Link } from 'react-router-dom';

interface IDrugProps {
  drugId: string;
  // drugSource: string;
}

interface IDrugState {
  isLoaded: boolean;
}

// const [characteristics, setCharacteristics] = React.useState([]);

// const changeCharactetistics = ({ value, checked }) =>
//   checked
//     ? setCharacteristics([...characteristics, value])
//     : setCharacteristics(characteristics.filter(characteristic => characteristic !== value));

class Experimental extends PureComponent<IDrugProps, IDrugState> {
  state = {
    candidate: {},
    candidateName: "",
    isLoaded: false,
    drugStatus: '',
    drugSource: '',
    batch: "",
    batchLabel: "",
    batchProgress: "",
    previous: '',
    next: ''
  };

  componentDidUpdate(prevProps: IDrugProps) {
    if (prevProps.drugId !== this.props.drugId) {
      this.fetch();
    }
  }

  componentDidMount() {
    this.fetch();
  }

  fetch() {
    const { drugId } = this.props;
    // axios.get(`/candidates/${drugId}`).then((({data}) => this.setState({candidate: data, candidateName: data.candidateName, drugSource: data.sourceType, isLoaded: true, drugStatus: data.flag, batch: data.batchId}))).then(
    //   response => {
    //   axios.get(`/batches/${this.state.batch}?source=${this.state.drugSource}`).then((({data}) => this.setState({batchLabel: data.label, batchProgress: data.batch_fill})))})
    // axios.get(`id_window?target=${drugId}`).then((({data}) => this.setState({previous: data.prev, next: data.next})))

    axios.get(`/candidates/${drugId}`).then(({ data }) =>
      this.setState(
        {
          candidate: data,
          candidateName: data.candidateName,
          batch: data.batchId,
          drugSource: data.sourceType,
          isLoaded: true,
          drugStatus: data.flag
        }
        )
        ).then(response => {
          axios.get(`/batches/${this.state.batch}?source=${this.state.drugSource}`).then((({data}) => 
          this.setState({
            batchLabel: data.label, 
            batchProgress: data.batch_fill
          })))})
          ;
    axios.get(`id_window?target=${drugId}`).then(({ data }) =>
      this.setState({
        previous: data.prev, 
        next: data.next
      }))
        }

  changeCharactetistics = ({ value, drugStatus }: ISelectTarget) => {
    const { drugId } = this.props;
    this.setState({ drugStatus : value })
      if (value === "Flag.TP") {
        axios.put(`update?id=${drugId}&nflag=tp`).then(
          response => {
          axios.get(`/batches/${this.state.batch}?source=${this.state.drugSource}`).then((({data}) => this.setState({batchProgress: data.batch_fill})))})
      }
      else if (value === "Flag.FP") {
        axios.put(`update?id=${drugId}&nflag=fp`).then(
          response => {
          axios.get(`/batches/${this.state.batch}?source=${this.state.drugSource}`).then((({data}) => this.setState({batchProgress: data.batch_fill})))})
      }
      else if (value === "Flag.black_list") {
        axios.put(`update?id=${drugId}&nflag=bl`).then(
          response => {
          axios.get(`/batches/${this.state.batch}?source=${this.state.drugSource}`).then((({data}) => this.setState({batchProgress: data.batch_fill})))})
      }
      else if (value === "Flag.No_flag") {
        axios.put(`update?id=${drugId}&nflag=none`).then(
          response => {
          axios.get(`/batches/${this.state.batch}?source=${this.state.drugSource}`).then((({data}) => this.setState({batchProgress: data.batch_fill})))})
          }
  };

  render() {
      const {candidate, candidateName, isLoaded, drugStatus, previous, next, batch, batchProgress, batchLabel, drugSource} = this.state
      let candidateNameHeader;
      if (candidateName.length > 20)
      {   
      candidateNameHeader = 
      <div>
        <h1>
          {candidateName} <br/>
          candidate page
        </h1>
    </div>
      }
    else {
      candidateNameHeader = 
      <div>
        <h1>
          {candidateName} candidate page
        </h1>
    </div>
    }
      let nextPrevious;
      if (next === null)
      {
        nextPrevious = <div>
                    <Link to={`/drugs/${this.state.previous}`}
                    >
                      Previous candidate
                      </Link>
                     </div>
      }
      else if (previous === null)
      {
        nextPrevious = <div>
                    <Link to={`/drugs/${this.state.next}`}
                    >
                      Next candidate
                      </Link>
                     </div>
      }
      else {
        nextPrevious = <div>
                    <div>
                    <Link to={`/drugs/${this.state.previous}`}
                    >
                      Previous candidate
                      </Link>
                  </div>

          <div>
                    <Link to={`/drugs/${this.state.next}`}
                    >
                      Next candidate
                      </Link>
                  </div>

        </div>
      }
    let abstractBaseURL;
    abstractBaseURL = 'http://dev-3.dev.bostongene.internal:9000'
    let sourceTable;
    if (this.state.drugSource === 'abstracts') {
      sourceTable = (
        <Table
          items={candidate.sourceInformation}
          schema={[
            {
              name: 'Source ID',
              template: (sourceInformation) => (
                <div>
                  {/* <a href={`https://clinicaltrials.gov/ct2/show/${sourceInformation.abstractId}`}> */}
                  {/* <a
                    href={`${process.env.REACT_APP_ABSTRACT_LINK}webprogram/Paper${sourceInformation.abstractId}.html`}
                  > */}
                  <a href={`${abstractBaseURL}${sourceInformation.internalLink}`}>
                    <strong>{sourceInformation.abstractId}</strong>
                  </a>
                </div>
              ),
              className: 'col-xs-3'
            },
            {
              name: 'Source Title',
              template: (sourceInformation) => <div>{sourceInformation.abstractTitle}</div>,
              className: 'col-xs-3'
            },
            {
              name: 'Sentence',
              template: (sourceInformation) => <div>{sourceInformation.sentence}</div>,
              className: 'col-xs-3'
            },
            {
              name: 'Conference',
              template: (sourceInformation) => <div>{sourceInformation.conferenceInfo}</div>,
              className: 'col-xs-3'
            }
          ]}
        />
      );
    } else {
      sourceTable = (
        <Table
          items={candidate.sourceInformation}
          schema={[
            {
              name: 'Source ID',
              template: (sourceInformation) => (
                <div>
                  <a href={`https://clinicaltrials.gov/ct2/show/${sourceInformation.nctId}`}>
                    <strong>{sourceInformation.nctId}</strong>
                  </a>
                </div>
              ),
              className: 'col-xs-3'
            },
            {
              name: 'Source Title',
              template: (sourceInformation) => <div>{sourceInformation.nctBriefTitle}</div>,
              className: 'col-xs-3'
            },
            {
              name: 'Sentence',
              template: (sourceInformation) => <div>{sourceInformation.nctSentence}</div>,
              className: 'col-xs-3'
            }
          ]}
        />
      );
    }
    return (
      isLoaded && (
        <div>
          {/* <h1>{process.env.REACT_APP_ABSTRACT_LINK} AAA</h1> */}

          <h1>{this.props.drugSource}</h1>
          {candidateNameHeader}
          <div className="batch-progress__label">  
        <h3>
        <Link to={`/${drugSource}?batch=${batch}`}>
        {batchLabel} {batchProgress}
        </Link>
        </h3>
      </div>
          {nextPrevious}

          {/* <div>
              <Button onClick = {() => history.goBack()} className="bg-button--primary">Back to table</Button>
          </div> */}
          <div className="radio-set">
            <div>
              <Radio
                name="flagRadio"
                value="Flag.TP"
                label="TP"
                checked={drugStatus === 'Flag.TP'}
                onChange={this.changeCharactetistics}
              />
            </div>
            <div>
              <Radio
                name="flagRadio"
                value="Flag.FP"
                label="FP"
                checked={drugStatus === 'Flag.FP'}
                onChange={this.changeCharactetistics}
              />
            </div>
            <div>
              <Radio
                name="flagRadio"
                label="Black List"
                value="Flag.black_list"
                checked={drugStatus === 'Flag.black_list'}
                onChange={this.changeCharactetistics}
              />
            </div>
            <div>
              <Radio
                name="flagRadio"
                label="No Flag"
                value="Flag.No_flag"
                checked={drugStatus === 'Flag.No_flag'}
                onChange={this.changeCharactetistics}
              />
            </div>
          </div>
          <div className="candidate-table" >
          <h2>Source information</h2>
          {sourceTable}
          {/* <Table
            items={candidate.sourceInformation}
            schema={[
              {
                name: 'Source ID',
                template: sourceInformation => (
                  <div>
                    <a href={`https://clinicaltrials.gov/ct2/show/${sourceInformation.nctId}`}>
                    <strong>{sourceInformation.nctId}</strong>
                    </a>
                  </div>
                ),
                className: 'col-xs-4'
              },
              {
                name: 'Source Title',
                template: sourceInformation => (
                  <div>
                    {sourceInformation.nctBriefTitle}
                  </div>
                ),      
                className: 'col-xs-4'
              },
              {
                name: 'Sentence',
                template: sourceInformation => (
                  <div>
                    {sourceInformation.nctSentence}
                  </div>
                ),
                className: 'col-xs-4'
              }
            ]}
          /> */}
          <h2>NCI information</h2>
          <Table
            items={candidate.nciInformation}
            schema={[
              {
                name: 'FDA applications',
                template: ({ fdaApplications }) =>
                  fdaApplications.some((element) => element.fdaApplicationNumber !== '') ? (
                    <ul>
                      {fdaApplications.map(
                        ({ drugName, fdaApplicationNumber, fdaLabelLink }, i) => (
                          <li key={i}>
                            {fdaApplicationNumber ? (
                              <a href={fdaLabelLink} target="_blank" rel="noopener noreferrer">
                                {drugName} - {fdaApplicationNumber}
                              </a>
                            ) : null}{' '}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div>&mdash;</div>
                  ),
                className: 'col-xs-3'
              },
              {
                name: 'Last FDA date',
                template: ({ fdaApplications }) =>
                  fdaApplications.some((element) => element.fdaLabelDate !== '') ? (
                    <ul>
                      {fdaApplications.map(({ fdaLabelDate }, i) => (
                        <li key={i}>{fdaLabelDate}</li>
                      ))}
                    </ul>
                  ) : (
                    <div>&mdash;</div>
                  ),
                className: 'col-xs-2 '
              },
              {
                name: 'Synonyms',
                template: ({ canonicalNameSynonyms }) =>
                  canonicalNameSynonyms.some((element) => element.Term !== '') ? (
                    <ul>
                      {canonicalNameSynonyms.map(({ Term, Source, Type }, i) => (
                        <li key={i}>
                          {Term}, Source - {Source}, Type - {Type}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div>&mdash;</div>
                  ),
                className: 'col-xs-3'
              },
              {
                name: 'Canonical names',
                template: ({ canonicalName, thesaurusLink }) => (
                  <div>
                    {canonicalName}{' '}
                    {thesaurusLink ? (
                      <a href={thesaurusLink} target="_blank" rel="noopener noreferrer">
                        Cancer.gov Link
                      </a>
                    ) : null}
                  </div>
                ),
                className: 'col-xs-4'
              }
            ]}
            rowHeightSize="medium"
          />
          <h2>Max drug phase in NCT:</h2>
          <Table
            items={candidate.maxDrugPhaseInformation}
            schema={[
              {
                name: 'NCT ID',
                template: (maxDrugPhaseInformation) => (
                  <div>
                    <a
                      href={`https://clinicaltrials.gov/ct2/show/${maxDrugPhaseInformation.nctId}`}
                    >
                      <strong>{maxDrugPhaseInformation.nctId}</strong>
                    </a>
                  </div>
                ),
                className: 'col-xs-4'
              },
              {
                name: 'Brief Title',
                template: (maxDrugPhaseInformation) => (
                  <div>{maxDrugPhaseInformation.nctBriefTitle}</div>
                ),
                className: 'col-xs-4'
              },
              {
                name: 'Phase',
                template: (maxDrugPhaseInformation) => (
                  <div>{maxDrugPhaseInformation.nctMaxPhase}</div>
                ),
                className: 'col-xs-4'
              }
            ]}
          />
          <h2>Clinical trials information</h2>
          <Table
            items={candidate.clinicalTrialsInformation}
            schema={[
              {
                name: 'NCT ID',
                template: (clinicalTrialsInformation) => (
                  <div>
                    <a
                      href={`https://clinicaltrials.gov/ct2/show/${clinicalTrialsInformation.nctId}`}
                    >
                      <strong>{clinicalTrialsInformation.nctId}</strong>
                    </a>
                  </div>
                ),
                className: 'col-xs-3'
              },
              {
                name: 'Title',
                template: (clinicalTrialsInformation) => (
                  <div>{clinicalTrialsInformation.nctBriefTitle}</div>
                ),
                className: 'col-xs-3'
              },
              {
                name: 'Phase',
                template: (clinicalTrialsInformation) => (
                  <div>{clinicalTrialsInformation.nctPhase}</div>
                ),
                className: 'col-xs-3'
              },
              {
                name: 'Interventions',
                template: (clinicalTrialsInformation) => (
                  <div>{clinicalTrialsInformation.nctInterventions}</div>
                ),
                className: 'col-xs-3'
              }
            ]}
          />
          </div>
          {candidate.foundInAvicennaInformation.count > 0 && (
            <div className="avicenna-block__label">
              <h2>{candidate.foundInAvicennaInformation.drugName} is found in Avicenna!</h2>
            </div>
          )}
        </div>
      )
    );
  }
}
// <Button className="next-buttin">Next candidate</Button>
export default Experimental;

// class Experimental extends PureComponent<
//   IDrugProps, IDrugState > {
//     state = {
//       candidate: {},
//       isLoaded: false,
//       drugStatus: "",
//     }

//     // getDerivedStateFromProps(props, state){

//     // }
//     componentDidMount(){
//       const {drugId} = this.props
//       axios.get(`/candidates/${drugId}`).then((({data}) => this.setState({candidate: data, isLoaded: true, drugStatus: data.flag}, () => console.log(this.state.drugStatus))))
//       }
//     changeCharactetistics = ({ value, drugStatus }: ISelectTarget) => {
//       const {drugId} = this.props
//       this.setState({ drugStatus : value }, (() => console.log(value)))
//       if (value === "Flag.TP") {
//         axios.put(`update?id=${drugId}&nflag=tp`)
//       }
//       else if (value === "Flag.FP") {
//         axios.put(`update?id=${drugId}&nflag=fp`)
//       }
//       else if (value === "Flag.black_list") {
//         axios.put(`update?id=${drugId}&nflag=bl`)
//       }
//       else if (value === "Flag.No_flag") {
//         axios.put(`update?id=${drugId}&nflag=none`)
//       }
//     };

//     render(){
//       const {candidate, isLoaded, drugStatus} = this.state
//       return isLoaded &&
//           <div>
//           <h1>{candidate.candidateName} candidate page</h1>
//           {/* <div>
//               <Button onClick = {() => history.goBack()} className="bg-button--primary">Back to table</Button>
//           </div> */}
//           <div className="radio-set">
//             <div>
//             <Radio
//               name="flagRadio"
//               value="Flag.TP"
//               label="TP"
//               checked={drugStatus === "Flag.TP"}
//               onChange={this.changeCharactetistics}
//               />
//             </div>
//             <div>
//               <Radio
//                 name="flagRadio"
//                 value="Flag.FP"
//                 label="FP"
//                 checked={drugStatus === "Flag.FP"}
//                 onChange={this.changeCharactetistics}
//               />
//             </div>
//             <div>
//               <Radio
//                 name="flagRadio"
//                 label="Black List"
//                 value="Flag.black_list"
//                 checked={drugStatus === "Flag.black_list"}
//                 onChange={this.changeCharactetistics}
//               />
//             </div>
//             <div>
//               <Radio
//                 name="flagRadio"
//                 label="No Flag"
//                 value="Flag.No_flag"
//                 checked={drugStatus === "Flag.No_flag"}
//                 onChange={this.changeCharactetistics}
//               />
//             </div>
//           </div>
//           <h2>Source information</h2>
//           <Table
//             items={candidate.sourceInformation}
//             schema={[
//               {
//                 name: 'Source ID',
//                 template: sourceInformation => (
//                   <div>
//                     <a href={`https://clinicaltrials.gov/ct2/show/${sourceInformation.nctId}`}>
//                     <strong>{sourceInformation.nctId}</strong>
//                     </a>
//                   </div>
//                 ),
//                 className: 'col-xs-3'
//               },
//               {
//                 name: 'Source Title',
//                 template: sourceInformation => (
//                   <div>
//                     {sourceInformation.nctBriefTitle}
//                   </div>
//                 ),
//                 className: 'col-xs-3'
//               },
//               {
//                 name: 'Sentence',
//                 template: sourceInformation => (
//                   <div>
//                     {sourceInformation.nctSentence}
//                   </div>
//                 ),
//                 className: 'col-xs-3'
//               },
//               {
//                 name: 'Conference',
//                 template: sourceInformation => (
//                   <div>
//                     {sourceInformation.nctSentence}
//                   </div>
//                 ),
//                 className: 'col-xs-3'
//               },
//             ]}
//           />
//           <h2>NCI information</h2>
//           <Table
//         items={candidate.nciInformation}
//         schema={[
//           {
//             name: 'FDA applications',
//             template: ({ fdaApplications }) =>
//             fdaApplications.some((element) => element.fdaApplicationNumber !== '') ? (
//                 <ul>
//                   {fdaApplications.map(({drugName, fdaApplicationNumber, fdaLabelLink}, i) => (
//                     <li key={i}>{fdaApplicationNumber ? (
//                       <a href={fdaLabelLink} target="_blank" rel="noopener noreferrer">
//                        {drugName} - {fdaApplicationNumber}
//                       </a>
//                     ) : null}{' '}
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <div>&mdash;</div>
//               ),
//             className: 'col-xs-3'
//           },
//           {
//             name: 'Last FDA date',
//                         template: ({ fdaApplications }) =>
//                         fdaApplications.some((element) => element.fdaLabelDate !== '') ? (
//                 <ul>
//                   {fdaApplications.map(({fdaLabelDate}, i) => (
//                     <li key={i}>{fdaLabelDate}</li>
//                   ))}
//                 </ul>
//               ) : (
//                 <div>&mdash;</div>
//               ),
//         className: 'col-xs-2 '
//           },
//           {
//             name: 'Synonyms',
//             template: ({ canonicalNameSynonyms }) =>
//             canonicalNameSynonyms.some((element) => element.Term !== '') ? (
//               <ul>
//               {canonicalNameSynonyms.map(({Term, Source, Type}, i) => (
//                 <li key={i}>{Term}, Source - {Source}, Type - {Type}</li>
//               ))}
//             </ul>
//           ) : (
//             <div>&mdash;</div>
//           ),
//             className: 'col-xs-3'
//           },
//           {
//             name: 'Canonical names',
//             template: ({ canonicalName, thesaurusLink }) => (
//               <div>
//                 {canonicalName}{' '}
//                 {thesaurusLink ? (
//                   <a href={thesaurusLink} target="_blank" rel="noopener noreferrer">
//                     Cancer.gov Link
//                   </a>
//                 ) : null}
//               </div>
//             ),
//             className: 'col-xs-4'
//           },
//         ]}
//         rowHeightSize="medium"
//       />
//                 <h2>Max drug phase in NCT:</h2>
//           <Table
//             items={candidate.maxDrugPhaseInformation}
//             schema={[
//             {
//               name: 'NCT ID',
//               template: maxDrugPhaseInformation => (
//                 <div>
//                     <a href={`https://clinicaltrials.gov/ct2/show/${maxDrugPhaseInformation.nctId}`}>
//                   <strong>{maxDrugPhaseInformation.nctId}</strong>
//                   </a>
//                 </div>
//               ),
//               className: 'col-xs-4'
//             },
//             {
//               name: 'Brief Title',
//               template: maxDrugPhaseInformation => (
//                 <div>
//                   {maxDrugPhaseInformation.nctBriefTitle}
//                 </div>
//               ),
//               className: 'col-xs-4'
//             },
//             {
//               name: 'Phase',
//               template: maxDrugPhaseInformation => (
//                 <div>
//                   {maxDrugPhaseInformation.nctMaxPhase}
//                 </div>
//               ),
//               className: 'col-xs-4'
//             },
//           ]}
//         />
//                     <h2>Clinical trials information</h2>
//           <Table
//             items={candidate.clinicalTrialsInformation}
//             schema={[
//               {
//                 name: 'NCT ID',
//                 template: clinicalTrialsInformation => (
//                   <div>
//                     <a href={`https://clinicaltrials.gov/ct2/show/${clinicalTrialsInformation.nctId}`}>
//                     <strong>{clinicalTrialsInformation.nctId}</strong>
//                     </a>
//                   </div>
//                 ),
//                 className: 'col-xs-3'
//               },
//               {
//                 name: 'Title',
//                 template: clinicalTrialsInformation => (
//                   <div>
//                     {clinicalTrialsInformation.nctBriefTitle}
//                   </div>
//                 ),
//                 className: 'col-xs-3'
//               },
//               {
//                 name: 'Phase',
//                 template: clinicalTrialsInformation => (
//                   <div>
//                     {clinicalTrialsInformation.nctPhase}
//                   </div>
//                 ),
//                 className: 'col-xs-3'
//               },
//               {
//                 name: 'Interventions',
//                 template: clinicalTrialsInformation => (
//                   <div>
//                     {clinicalTrialsInformation.nctInterventions}
//                   </div>
//                 ),
//                 className: 'col-xs-3'
//               }
//             ]}
//           />
//           {candidate.foundInAvicennaInformation.count > 0 &&
//             <div className="avicenna-block__label">
//               <h2>
//             {candidate.foundInAvicennaInformation.drugName} is found in Avicenna!
//               </h2>
//             </div>

//           }
//           </div>
//     }
//   }
// export default Experimental;
