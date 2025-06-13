document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const totalBillInput = document.getElementById('totalBill');
    const discountsContainer = document.getElementById('discountsContainer');
    const extrasContainer = document.getElementById('extrasContainer');
    const peopleContainer = document.getElementById('peopleContainer');
    const addDiscountBtn = document.getElementById('addDiscount');
    const addExtraBtn = document.getElementById('addExtra');
    const addPersonBtn = document.getElementById('addPerson');
    const calculateBtn = document.getElementById('calculateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const newCalcBtn = document.getElementById('newCalcBtn');
    const resultsSection = document.getElementById('results');
    const summaryResults = document.getElementById('summaryResults');
    const individualResults = document.getElementById('individualResults');

    // Add discount field
    addDiscountBtn.addEventListener('click', function() {
        addInputField(discountsContainer, 'Discount', 'discount');
    });

    // Add extra expense field
    addExtraBtn.addEventListener('click', function() {
        addInputField(extrasContainer, 'Extra', 'extra');
    });

    // Add person field
    addPersonBtn.addEventListener('click', function() {
        const personId = Date.now();
        const personDiv = document.createElement('div');
        personDiv.className = 'person-item';
        personDiv.innerHTML = `
            <input type="text" class="person-name" placeholder="Person name" required>
            <input type="number" class="person-amount" placeholder="Amount" min="0" step="0.01">
            <button class="remove-btn" data-id="${personId}"><i class="fas fa-times"></i></button>
        `;
        peopleContainer.appendChild(personDiv);
        
        // Add remove functionality
        personDiv.querySelector('.remove-btn').addEventListener('click', function() {
            peopleContainer.removeChild(personDiv);
        });
    });

    // Calculate button click
    calculateBtn.addEventListener('click', calculateSplit);

    // Save button click
    saveBtn.addEventListener('click', saveCalculation);

    // New calculation button click
    newCalcBtn.addEventListener('click', resetCalculator);

    // Helper function to add input fields (for discounts and extras)
    function addInputField(container, label, type) {
        const fieldId = Date.now();
        const fieldDiv = document.createElement('div');
        fieldDiv.className = `${type}-item`;
        fieldDiv.innerHTML = `
            <input type="text" class="${type}-desc" placeholder="${label} description">
            <input type="number" class="${type}-amount" placeholder="Amount" min="0" step="0.01">
            <button class="remove-btn" data-id="${fieldId}"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(fieldDiv);
        
        // Add remove functionality
        fieldDiv.querySelector('.remove-btn').addEventListener('click', function() {
            container.removeChild(fieldDiv);
        });
    }

    // Main calculation function
    function calculateSplit() {
        const totalBill = parseFloat(totalBillInput.value) || 0;
        
        // Get all discounts
        const discountElements = discountsContainer.querySelectorAll('.discount-item');
        let totalDiscount = 0;
        const discounts = [];
        
        discountElements.forEach(item => {
            const amount = parseFloat(item.querySelector('.discount-amount').value) || 0;
            const desc = item.querySelector('.discount-desc').value || 'Discount';
            discounts.push({ desc, amount });
            totalDiscount += amount;
        });
        
        // Get all extras
        const extraElements = extrasContainer.querySelectorAll('.extra-item');
        let totalExtra = 0;
        const extras = [];
        
        extraElements.forEach(item => {
            const amount = parseFloat(item.querySelector('.extra-amount').value) || 0;
            const desc = item.querySelector('.extra-desc').value || 'Extra';
            extras.push({ desc, amount });
            totalExtra += amount;
        });
        
        // Calculate adjusted total
        const adjustedTotal = totalBill - totalDiscount + totalExtra;
        
        // Get all people
        const personElements = peopleContainer.querySelectorAll('.person-item');
        const people = [];
        let totalPersonAmount = 0;
        
        personElements.forEach(item => {
            const name = item.querySelector('.person-name').value || 'Anonymous';
            const amount = parseFloat(item.querySelector('.person-amount').value) || 0;
            people.push({ name, amount });
            totalPersonAmount += amount;
        });
        
        // Calculate each person's share
        const peopleWithShares = people.map(person => {
            const share = totalPersonAmount > 0 ? 
                (person.amount / totalPersonAmount) * adjustedTotal : 
                adjustedTotal / people.length;
            return {
                name: person.name,
                amount: person.amount,
                share: share,
                percentage: totalPersonAmount > 0 ? (person.amount / totalPersonAmount * 100).toFixed(2) : (100 / people.length).toFixed(2)
            };
        });
        
        // Display results
        displayResults(totalBill, totalDiscount, totalExtra, adjustedTotal, peopleWithShares);
    }

    // Display results function
    function displayResults(totalBill, totalDiscount, totalExtra, adjustedTotal, people) {
        // Show results section
        resultsSection.style.display = 'block';
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Create summary HTML
        let summaryHTML = `
            <div class="summary-card">
                <div class="summary-item">
                    <span>Original Bill:</span>
                    <span>$${totalBill.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Total Discounts:</span>
                    <span>-$${totalDiscount.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span>Total Extras:</span>
                    <span>+$${totalExtra.toFixed(2)}</span>
                </div>
                <div class="summary-item total">
                    <span>Total to Split:</span>
                    <span>$${adjustedTotal.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        summaryResults.innerHTML = summaryHTML;
        
        // Create individual shares HTML
        let individualHTML = '';
        people.forEach(person => {
            individualHTML += `
                <div class="person-card">
                    <h3><i class="fas fa-user"></i> ${person.name}</h3>
                    <div class="person-detail">
                        <span>Contribution:</span>
                        <span>$${person.amount.toFixed(2)} (${person.percentage}%)</span>
                    </div>
                    <div class="person-detail">
                        <span>Owes:</span>
                        <span>$${person.share.toFixed(2)}</span>
                    </div>
                </div>
            `;
        });
        
        individualResults.innerHTML = individualHTML;
    }

    // Save calculation function
    function saveCalculation() {
        const totalBill = parseFloat(totalBillInput.value) || 0;
        
        // Get all discounts
        const discountElements = discountsContainer.querySelectorAll('.discount-item');
        let totalDiscount = 0;
        const discounts = [];
        
        discountElements.forEach(item => {
            const amount = parseFloat(item.querySelector('.discount-amount').value) || 0;
            const desc = item.querySelector('.discount-desc').value || 'Discount';
            discounts.push({ desc, amount });
            totalDiscount += amount;
        });
        
        // Get all extras
        const extraElements = extrasContainer.querySelectorAll('.extra-item');
        let totalExtra = 0;
        const extras = [];
        
        extraElements.forEach(item => {
            const amount = parseFloat(item.querySelector('.extra-amount').value) || 0;
            const desc = item.querySelector('.extra-desc').value || 'Extra';
            extras.push({ desc, amount });
            totalExtra += amount;
        });
        
        // Get all people
        const personElements = peopleContainer.querySelectorAll('.person-item');
        const people = [];
        
        personElements.forEach(item => {
            const name = item.querySelector('.person-name').value || 'Anonymous';
            const amount = parseFloat(item.querySelector('.person-amount').value) || 0;
            people.push({ name, amount });
        });
        
        // Prepare data to send
        const data = {
            totalBill,
            discounts,
            extras,
            people,
            timestamp: new Date().toISOString()
        };
        
        // Send data to PHP for saving
        fetch('process.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Calculation saved successfully!');
            } else {
                alert('Error saving calculation: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error saving calculation');
        });
    }

    // Reset calculator function
    function resetCalculator() {
        totalBillInput.value = '';
        discountsContainer.innerHTML = '';
        extrasContainer.innerHTML = '';
        peopleContainer.innerHTML = '';
        resultsSection.style.display = 'none';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});