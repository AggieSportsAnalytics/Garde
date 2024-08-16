import React, { useState } from 'react';
import Modal from 'react-modal';

const HeightInputModal = ({ isOpen, onClose, onSave }) => {
  const [height, setHeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (height) {
      onSave(parseFloat(height));
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Enter Height"
      ariaHideApp={false}
      style={{
        content: {
          width: '300px', // Adjust the width here
          height: '200px', // Adjust the height here
          margin: 'auto',
          padding: '20px',
        },
      }}
    >
      <h2>Enter Height (m)</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="e.g., 1.75"
          required
          style={{
            width: '80%', // Adjust width to fit within modal
            padding: '8px',
            marginBottom: '10px',
          }}
        />
        <div>
          <button type="submit" style={{ marginRight: '10px' }}>Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
};

export default HeightInputModal;
