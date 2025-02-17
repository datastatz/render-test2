import { useState, useEffect } from 'react'; // Importing state and effect
import axios from 'axios'; // Importing Axios for using the JSON Server
import React from 'react'; // Obviously importing React

// Component that filters and that takes two props searchTerm and handleSearchChange
const Filter = ({ searchTerm, handleSearchChange }) => {
  return (
    <div>
      filter shown with: <input value={searchTerm} onChange={handleSearchChange} />
    </div>
  );
};

//Component that holds the form and the button with their respective props
const PersonForm = ({ newName, newNumber, handleNewName, handleNewNumber, addPerson }) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={handleNewName} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNewNumber} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

// Shows the names and numbers in the list 
const Persons = ({ filterPersons, deletePerson }) => {
  return (
    <div className = "list">
      {filterPersons.map((person) => (
        <div key={person.id}>
          {person.name} {person.number}{' '}
          <button onClick={() => deletePerson(person.id)}>delete</button>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'


  // Fetches the initial data from the phonebook only ones when starting the App, 
  useEffect(() => {
    axios.get('http://localhost:3001/persons').then((response) => {
      setPersons(response.data);
    });
  }, []);

  const handleNewName = (event) => setNewName(event.target.value); // Function that updates newName state when user types
  const handleNewNumber = (event) => setNewNumber(event.target.value); // Function that updates newNumber state when user types
  const handleSearchChange = (event) => setSearchTerm(event.target.value); // Function that updates searchTerm state when user types

    //Writing a function that shows that a person is added
    const Notification = ({ message, type }) => {
      if (message === null) {
        return null;
      }

      return (
        <div className={`${type}`}>
          {message}
        </div>
      );
    }

    const addPerson = (event) => {
      event.preventDefault();
    
      // Helper function to display notifications
      const showNotification = (message, type = 'success') => {
        setNotification(message);
        setNotificationType(type);
        setTimeout(() => {
          setNotification(null);
        }, 3000); // Clears the notification after 3 seconds
      };
    
      // Check if the person already exists
      const existingPerson = persons.find((person) => person.name === newName);
      
      if (existingPerson) {
        if (
          window.confirm(
            `${newName} is already in the phonebook, replace the old number with the new one?`
          )
        ) {
          const updatedPerson = { ...existingPerson, number: newNumber };
    
          axios
            .put(`http://localhost:3001/persons/${existingPerson.id}`, updatedPerson)
            .then((response) => {
              // Update the local state with the updated person
              setPersons(
                persons.map((person) =>
                  person.id !== existingPerson.id ? person : response.data
                )
              );
              setNewName('');
              setNewNumber('');
              // Show a notification indicating a successful update
              showNotification(`Updated ${newName}`, 'success');
            })
            .catch((error) => {
              // In case of error updating the number
              showNotification(`Error updating ${newName}`, 'error');
            });
        }
        return;
      }
    
      // If the person doesn't already exist, create a new one
      const personObject = { name: newName, number: newNumber, id: Date.now() };
    
      axios
        .post('http://localhost:3001/persons', personObject)
        .then((response) => {
          setPersons([...persons, response.data]);
          setNewName('');
          setNewNumber('');
          // Show a notification indicating a successful addition
          showNotification(`Added ${newName}`, 'success');
        })
        .catch((error) => {
          showNotification(`Error adding ${newName}`, 'error');
        });
    };
    


  const deletePerson = (id) => {
    const person = persons.find((p) => p.id === id);
    if (window.confirm(`Delete ${person.name}?`)) {
      axios.delete(`http://localhost:3001/persons/${id}`).then(() => {
        setPersons(persons.filter((p) => p.id !== id));
      });
    }
  };

  const filterPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} type={notificationType} />
      <Filter searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
      <h3>Add a new</h3>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNewName={handleNewName}
        handleNewNumber={handleNewNumber}
        addPerson={addPerson}
      />
      <h3>Numbers</h3>
      <Persons filterPersons={filterPersons} deletePerson={deletePerson} />
    </div>
  );
};

export default App;
