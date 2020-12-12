import React, {useEffect, useState} from 'react';
import { ACCOUNTS, CONTACTS, LEADS } from '../../common/apiUrls';
import BreadCrumb from '../UIComponents/BreadCrumb/BreadCrumb';
import TextInput from '../UIComponents/Inputs/TextInput';
import PhoneInput from '../UIComponents/Inputs/PhoneInput';
import FileInput from '../UIComponents/Inputs/FileInput';
import EmailInput from '../UIComponents/Inputs/EmailInput';
import TextArea from '../UIComponents/Inputs/TextArea';
import SelectComponent from '../UIComponents/Inputs/SelectComponent';
import ReactSelect from '../UIComponents/ReactSelect/ReactSelect';
import { Validations } from './Validations';
import { countries, twoStatus } from '../optionsData';
import { getApiResults } from '../Utilities';
import axios from 'axios';

export default function EditAccount(props) {
  
  const [accountObject, setAccountObject] = useState({
    name: '', website: '', phone: '', email: '',
      billing_address_line: '', billing_street: '', billing_postcode: '',
      billing_city: '', billing_state: '', billing_country: '',
      status: 'open', lead:[], contacts: [],
  });
  const [leads, setLeads] = useState([]);
  const [availableLeads, setAvailableLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState('');
  const [isValidations, setIsValidations] = useState('true');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getContacts();
    getLeads();
    getAccount(); 
    console.log("Useeffect in add account");
  }, []);


  const getContacts = () => {    
    let contactsResults = getApiResults(CONTACTS);
    let contactsArray = [];
    contactsResults.then( result => {
      result.data.contact_obj_list.map( contact => {
        contactsArray.push({label: contact.first_name, value: contact.first_name, id: contact.id});
      })
      setContacts(contactsArray);
    })}

  const getLeads = () => {
    let leadsResults = getApiResults(LEADS);    
    let mergedLeads, leadsArray = [];
    leadsResults.then( result => {
      mergedLeads = result.data.open_leads.concat(result.data.close_leads);
      mergedLeads.map(lead => leadsArray.push({label: lead.title, value: lead.title, id: lead.id}));
    })
    setLeads(leadsArray);
  }
  
  const getAccount = () => {
    let userId = window.location.pathname.split('/')[2];
    let account = getApiResults(`${ACCOUNTS}${userId}/`);    
    account.then( acc => {      
      setAccountObject({...accountObject, name: acc.data.account_obj.name,
        website: acc.data.account_obj.website,
        phone: acc.data.account_obj.phone,
        email: acc.data.account_obj.email,
        billing_address_line: acc.data.account_obj.billing_address_line,
        billing_street: acc.data.account_obj.billing_street,
        billing_postcode: acc.data.account_obj.billing_postcode,
        billing_street: acc.data.account_obj.billing_street,
        billing_city: acc.data.account_obj.billing_city,
        billing_state: acc.data.account_obj.billing_state,
        billing_country: acc.data.account_obj.billing_country,
        status: acc.data.account_obj.status,
        lead: (acc.data.account_obj.lead) ? {label: acc.data.account_obj.lead.title, value: acc.data.account_obj.lead.title, id: acc.data.account_obj.lead.id}: '',        
        contacts: acc.data.account_obj.contacts.map( contact =>  ({label: contact.first_name, value: contact.first_name, id: contact.id}))
      });      
    })    
  }

  const handleChange = (e) => {    
    setAccountObject({...accountObject, [e.target.name]: e.target.value})    
  }  

  const addTags = event => {    
    if (event.key === 'Enter' && event.target.value !== "") {      
      setTags([...tags, event.target.value]);
      event.target.value="";
    }
  }

  const removeTags = index => {        
    setTags([...tags.filter(tag => tags.indexOf(tag) !== index)]);
  }
  
  const fileUpload = (e) => { 

    setFile(e.target.files[0]);
  }

  const updateAccount = (e) => {
    e.preventDefault();
    let userId = window.location.pathname.split('/')[2];

    // Retrieving contacts
    let contactsArr = [];
    availableContacts.map(contact => {
      contactsArr.push(contact.id);
    })

    // Creating formData for file
    const formData = new FormData();    
    formData.append("contact_attachment" , file);        

    // Validations
    let validationResults = Validations(accountObject);    
    setErrors(validationResults);
    for (let i in validationResults) {      
      if (validationResults[i].length > 0) {
          setIsValidations(false);
          break;
      }
    }      

    let config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `jwt ${localStorage.getItem('Token')}`,
        company: `${localStorage.getItem('SubDomain')}`
      }
    }    

    let data = {
      name: accountObject.name,
      website: accountObject.website,
      phone: accountObject.phone,
      email: accountObject.email,
      lead: accountObject.lead.id,
      billing_address_line: accountObject.billing_address_line,
      billing_street: accountObject.billing_street,
      billing_postcode: accountObject.billing_postcode, 
      billing_city: accountObject.billing_city,
      billing_state: accountObject.billing_state,
      billing_country: accountObject.billing_country,     
      status: accountObject.status,
      contacts: accountObject.contacts.map(contact => contact.id),
      tags: tags.join(','),
      account_attachment: file
    }
    
    if (isValidations) {
      axios.put(`${ACCOUNTS}${userId}/`, data, config).then(res => res);
    }    

  }    

  console.log(accountObject);
  return (
    <div id="mainbody" className="main_container" style={{ marginTop: '65px' }}>        
        <BreadCrumb target="accounts" action="create" />
        <form id="formid" action="" method="POST" novalidate="" enctype="multipart/form-data">        
          <div class="overview_form_block row marl justify-content-center">
            <div class="col-md-9">
              {/* card */}
              <div class="card">
                <div class="card-body">
                  <div class="card-title text-center">EDIT ACCOUNT</div>
                    <div className="row marl">
                      <div class="col-md-4">
                        <TextInput  elementSize="col-md-12" labelName="Name" attrName="name" attrPlaceholder="Name" inputId="id_name" 
                                    value={accountObject.name} getInputValue={handleChange} 
                                    isRequired={true} error={errors.name}/>
                        <TextInput  elementSize="col-md-12" labelName="Website" attrName="website" attrPlaceholder="Website" inputId="id_website" 
                                    value={accountObject.website} getInputValue={handleChange}/>
                        <PhoneInput elementSize="col-md-12" labelName="Phone" attrName="phone" attrPlaceholder="+911234567890" inputId="id_phone" 
                                    value={accountObject.phone} getInputValue={handleChange}/>                                                     
                        <EmailInput elementSize="col-md-12"  labelName="Email"  attrName="email"  attrPlaceholder="Email"  inputId="id_email"  
                                    value={accountObject.email} getInputValue={handleChange} 
                                    isRequired={true} error={errors.email}/>                        
                        <ReactSelect labelName="Leads" options={leads} value={accountObject.lead} getChangedValue={(e) => setAccountObject({...accountObject, lead: e})}/>
                      </div>
                      <div class="col-md-4">
                        <div class="filter_col billing_block col-md-12" style={{padding: "0px"}}>                                                    
                          <div class="row" style={{marginTop: "10px"}}>
                          <TextInput  elementSize="col-md-12" labelName="Billing Address" attrName="billing_address_line" attrPlaceholder="Address Line" inputId="id_billing_address_line" 
                                    value={accountObject.billing_address_line} getInputValue={handleChange} isRequired={true}/>                                    
                            <TextInput  elementSize="col-md-6" labelName="Street" attrName="billing_street" attrPlaceholder="Street" inputId="id_billing_street" 
                                    value={accountObject.billing_street} getInputValue={handleChange} isRequired={true}/>
                            <TextInput  elementSize="col-md-6" labelName="Postcode" attrName="billing_postcode" attrPlaceholder="Postcode" inputId="id_billing_postcode" 
                                    value={accountObject.billing_postcode} getInputValue={handleChange} isRequired={true}/>
                            <TextInput  elementSize="col-md-6" labelName="City" attrName="billing_city" attrPlaceholder="City" inputId="id_billing_city" 
                                    value={accountObject.billing_city} getInputValue={handleChange} isRequired={true}/>
                            <TextInput  elementSize="col-md-6" labelName="State" attrName="billing_state" attrPlaceholder="State" inputId="id_billing_state" 
                                    value={accountObject.billing_state} getInputValue={handleChange} isRequired={true}/>
                            <SelectComponent  elementSize="col-md-12" labelName="Country" attrName="billing_country" attrPlaceholder="Country" attrId="id_billing_country" 
                                              selectedValue={accountObject.billing_country} getInputValue={handleChange} options={countries} isrequired={true}/>                            
                            <ReactSelect  elementSize="col-md-12" labelName="Contacts" isMulti={true} options={contacts} 
                                          value={accountObject.contacts} getChangedValue={(e) => setAccountObject({...accountObject, contacts: e})}/>
                          </div>
                        </div>
                      </div>

                      <div class="col-md-4">
                        <ReactSelect labelName="Teams"/>
                        <ReactSelect labelName="Users" isDisabled={true}/>
                        <ReactSelect labelName="Assigned To"/>
                        <SelectComponent  labelName="Status" attrName="status" attrPlaceholder="Status" attrId="id_status" 
                                          value={accountObject.status} getInputValue={handleChange} options={twoStatus}/>
                        <div class="filter_col col-12">
                          <div class="form-group">
                            <label>Tags</label>

                            <div className="tags-input">
                              <ul>
                                  {tags.map((tag, index) => (
                                    <li
                                      key={index}>
                                      <span>{tag}</span>
                                      <b onClick={() => removeTags(index)}>x</b>
                                    </li>
                                  ))}
                              </ul>
                              <input
                                className="tags-input__input"
                                type="text"
                                onKeyUp={event => addTags(event)}
                                placeholder="add a tag"
                              />                              
                            </div>

                          </div>
                        </div>                        
                        <FileInput  elementSize="col-md-12" labelName="Attachment" attrName="account_attachment" inputId="id_file"  
                                    getFile={fileUpload}/>                        
                      </div>
                      <div class="col-md-12">
                        <div class="row marl buttons_row form_btn_row text-center">
                          <button class="btn btn-default save mr-1" name="save" type="button" id="call_save" onClick={updateAccount}>Save</button>
                          <a href="/accounts" class="btn btn-default clear" id="create_user_cancel">Cancel</a>
                        </div>
                      </div>
                    </div>
                  </div>
                {/* end of card body */}
              </div>
              {/* end of card */}
            </div>
          </div>
        </form>
      </div>
  )
}
