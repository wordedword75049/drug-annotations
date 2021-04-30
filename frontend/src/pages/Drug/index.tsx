import React, { Fragment, useState } from 'react';
import Button from '@bostongene/frontend-components/Button';
import { Link } from 'react-router-dom';
import Experimental from 'pages/Experimental';
import axios from 'axios'
interface IDrugProps {
  drugId: string;
}

const Drug = ({ drugId }: IDrugProps) => {
  // const [candidate, setCandidates] = useState([]);
  return (
    <div>
      <Experimental
      drugId = {drugId}/>
    </div>
  );
};

export default Drug;
