const products = [
    'Apple meomeo',
    'Samsung Galaxy S23',
    'Google Pixel 7',
    'OnePlus 11',
    'Xiaomi 13 Pro',
    'Sony Xperia 1 IV',
];

let productIndex = -1;

function displayProduct() {
    document.getElementById('productCount').innerText =
        products.length + ' products';
    const tableBody = document.getElementById('productList');
    tableBody.innerHTML = '';
    let row = '';
    for (let i = 0; i < products.length; i++) {
        row += '<tr>';
        row += `<td>${products[i]}</td>`;
        row += `<td><button type="button" onclick="handleEdit(${i})">Edit</button></td>`;
        row += `<td><button type="button" onclick="handleDelete(${i})">Delete</button></td>`;
        row += '</tr>';
    }
    tableBody.innerHTML = row;
}

function createProduct(e) {
    e.preventDefault();
    const productName = document.getElementById('productName').value;
    if (productIndex !== -1) {
        products[productIndex] = productName;
        productIndex = -1; // Reset index after editing
        document.getElementById('productName').value = ''; // Clear input field after edit
        document.getElementById('btnAdd').innerText = 'Add';
    } else {
        products.push(productName);
    }
    displayProduct();
}

function handleDelete(index) {
    if (confirm(`Bạn có muốn xóa sản phẩm ${products[index]} không?`)) {
        products.splice(index, 1);
        displayProduct();
    }
}

function handleEdit(index) {
    productIndex = index;
    const productName = products[index];
    console.log(productName);
    document.getElementById('productName').value = productName;
    document.getElementById('btnAdd').innerText = 'Update';
}

displayProduct();