document.addEventListener('DOMContentLoaded', function() {
    const commonDiscounts = ["Diskon Member", "Promo Akhir Tahun", "Voucher", "Cashback"];
    const commonExtras = ["Service Charge", "Pajak", "Tips", "Ongkir"];
    const commonPeople = ["Andi", "Budi", "Cindy", "Dedi"];

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
    const billTitleInput = document.getElementById('billTitle');
    const billDateInput = document.getElementById('billDate');
    const displayTitle = document.getElementById('displayTitle');
    const displayDate = document.getElementById('displayDate');
    const detailedViewBtn = document.getElementById('detailedView');
    const compactViewBtn = document.getElementById('compactView');

    // Set default date to today
    billDateInput.valueAsDate = new Date();

    // View toggle functionality
    detailedViewBtn.addEventListener('click', function() {
        individualResults.classList.remove('compact-view');
        detailedViewBtn.classList.add('active');
        compactViewBtn.classList.remove('active');
    });

    compactViewBtn.addEventListener('click', function() {
        individualResults.classList.add('compact-view');
        compactViewBtn.classList.add('active');
        detailedViewBtn.classList.remove('active');
    });

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
        
        // Create datalist for people suggestions
        const datalistId = `person-suggestions-${personId}`;
        let datalistHTML = `<datalist id="${datalistId}">`;
        commonPeople.forEach(person => {
            datalistHTML += `<option value="${person}">`;
        });
        datalistHTML += '</datalist>';
        
        personDiv.innerHTML = `
            ${datalistHTML}
            <input type="text" class="person-name" placeholder="Person name" list="${datalistId}" required>
            <input type="number" class="person-amount" placeholder="Amount" min="0" step="1">
            <button class="remove-btn" data-id="${personId}"><i class="fas fa-times"></i></button>
        `;
        peopleContainer.appendChild(personDiv);
        
        // Add remove functionality
        personDiv.querySelector('.remove-btn').addEventListener('click', function() {
            peopleContainer.removeChild(personDiv);
            calculateTotalBill(); // Recalculate when removing people
        });
        
        // Add event listener to recalculate when amounts change
        personDiv.querySelector('.person-amount').addEventListener('input', calculateTotalBill);
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
        
        // Create datalist for suggestions
        const datalistId = `${type}-suggestions-${fieldId}`;
        const suggestions = type === 'discount' ? commonDiscounts : 
                        type === 'extra' ? commonExtras : [];
        
        let datalistHTML = '';
        if (suggestions.length > 0) {
            datalistHTML = `<datalist id="${datalistId}">`;
            suggestions.forEach(suggestion => {
                datalistHTML += `<option value="${suggestion}">`;
            });
            datalistHTML += '</datalist>';
        }
        
        fieldDiv.innerHTML = `
            ${datalistHTML}
            <input type="text" class="${type}-desc" placeholder="${label} description" list="${datalistId}">
            <input type="number" class="${type}-amount" placeholder="Amount" min="0" step="1">
            <button class="remove-btn" data-id="${fieldId}"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(fieldDiv);
        
        // Add remove functionality
        fieldDiv.querySelector('.remove-btn').addEventListener('click', function() {
            container.removeChild(fieldDiv);
            calculateTotalBill(); // Recalculate when removing items
        });
        
        // Add event listener to recalculate when amounts change
        fieldDiv.querySelector(`.${type}-amount`).addEventListener('input', calculateTotalBill);
    }

    // Main calculation function
    function calculateSplit() {
        // Set bill title and date in results
        displayTitle.textContent = billTitleInput.value || 'Tagihan Tanpa Judul';
        
        const billDate = new Date(billDateInput.value);
        displayDate.textContent = billDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) || new Date().toLocaleDateString('id-ID');

        const totalBill = calculateTotalBill();
        
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
                Math.ceil((person.amount / totalPersonAmount) * adjustedTotal / 1000) * 1000 : 
                Math.ceil((adjustedTotal / people.length / 1000)) * 1000;
            return {
                name: person.name,
                amount: person.amount,
                share: share,
                percentage: totalPersonAmount > 0 ? (person.amount / totalPersonAmount * 100).toFixed(2) : (100 / people.length).toFixed(2)
            };
        });
        
        // Display results
        displayResults(totalDiscount, totalExtra, adjustedTotal, peopleWithShares);
        // Reset input fields
    }

    function calculateTotalBill() {
        let total = 0;
        
        // Sum all person amounts
        const personElements = peopleContainer.querySelectorAll('.person-item');
        personElements.forEach(person => {
            const amount = parseFloat(person.querySelector('.person-amount').value) || 0;
            total += amount;
        });
        
        // Display the calculated total
        if (total > 0) {
            document.getElementById('totalBillDisplay').textContent = formatRupiah(total);
        } else {
            document.getElementById('totalBillDisplay').textContent = 'Rp0';
        }
        
        return total;
    }

    function formatRupiah(amount) {
        return 'Rp' + Math.round(amount).toLocaleString('id-ID');
    }

    // Display results function
    function displayResults(totalDiscount, totalExtra, adjustedTotal, people) {
        // Show results section
        resultsSection.style.display = 'block';
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Create summary HTML
        let summaryHTML = `
            <div class="summary-card">
                <div class="summary-item">
                    <span>Total Kontribusi:</span>
                    <span>${formatRupiah(calculateTotalBill())}</span>
                </div>
                <div class="summary-item">
                    <span>Total Diskon:</span>
                    <span>-${formatRupiah(totalDiscount)}</span>
                </div>
                <div class="summary-item">
                    <span>Total Tambahan:</span>
                    <span>+${formatRupiah(totalExtra)}</span>
                </div>
                <div class="summary-item total">
                    <span>Total Dibayar:</span>
                    <span>${formatRupiah(adjustedTotal)}</span>
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
                        <span>Kontribusi:</span>
                        <span>${formatRupiah(person.amount)} (${person.percentage}%)</span>
                    </div>
                    <div class="person-detail">
                        <span>Harus Bayar:</span>
                        <span>${formatRupiah(person.share)}</span>
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