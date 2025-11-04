// File: src/app/home/components/public-search/public-search.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Api } from '../../../service/api';

@Component({
  selector: 'app-public-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './public-search.html',
  styleUrls: ['./public-search.scss'],
})
export class PublicSearch implements OnInit {
  form!: FormGroup;
  showSearchOverlay = true;

  // Dropdown options
  assetTypes: string[] = ['Movable', 'Immovable'];
  debtorTypes: string[] = ['Individual', 'Institute'];
  purposes: string[] = [
    'Ownership Change',
    'Cancellation of RC',
    'Conversion',
    'Self Checking',
    'Self Clearance',
  ];

  // explicit keys so template can access collateralMap.Movable / .Immovable
  collateralMap: { Movable: string[]; Immovable: string[] } = {
    Movable: ['Heavy Vehicles', 'Medium Vehicles', 'Light Vehicles', 'Two-Wheeler', 'Taxi'],
    Immovable: ['Land', 'Strata'],
  };

  // Available collateral options based on asset type
  availableCollaterals: string[] = [];
  collateralList: any[] = [];
  debtorTypeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'institute', label: 'Institute' },
  ];

  bankOptions = [
    { value: 'Bhutan National Bank', label: 'Bhutan National Bank' },
    { value: 'Bhutan Development Bank', label: 'Bhutan Development Bank' },
    { value: 'Druk PNB Bank', label: 'Druk PNB Bank' },
    { value: 'Bank of Bhutan', label: 'Bank of Bhutan' },
    { value: 'TBank', label: 'TBank' },
    { value: 'DK Bank', label: 'DK Bank' },
  ];
  serialCollaterals: any;
  generalCollaterals: any;
  nonMovableCollaterals: any;

  constructor(private fb: FormBuilder, private api: Api ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      searchBy: [''],
      debtorType: [''],
      cidNo: [''],
      identificationNumber: [''],
      bank: [''],
      accountNo: [''],
      assetType: ['', Validators.required],
      applicableFee: [''],
      collateralType: [''],
      // Stores the human-readable collateral name (e.g., "Land", "Strata") for UI logic
      collateralTypeName: [''],
      purpose: [''],
      requestedBy: ['', Validators.required],
      phoneNumber1: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      currentAddress: [''],
      remarks: [''],
      // New fields for immovable assets
      vehicleNo: [''],
      thramNo: [''],
      dzongkhag: [''],
      gewog: [''],
      plotId: [''],
      buildingNo: [''],
      flatNo: [''],
    });

    // 👇 Auto update applicable fee when debtor type changes
    this.form.get('debtorType')?.valueChanges.subscribe((debtorType) => {
      if (debtorType === 'individual') {
        this.form.patchValue({ applicableFee: 100 });
      } else if (debtorType === 'institute') {
        this.form.patchValue({ applicableFee: 200 });
      } else {
        this.form.patchValue({ applicableFee: '' });
      }
    });

    // 👇 Reset collateral type when asset type changes
    this.form.get('assetType')?.valueChanges.subscribe(() => {
      this.form.patchValue({ collateralType: '', collateralTypeName: '' });
    });
    this.getMasterData();
  }

  onCancel() {
    this.showSearchOverlay = false;
    console.log('Search canceled. Modal is now hidden.');
    window.location.reload();
  }

  onSearch() {
    if (this.form.valid) {
      console.log('Searching...', this.form.value);
    }
  }

  openSearchOverlay() {
    this.showSearchOverlay = true;
  }

  onAssetTypeChange() {
    const assetType = this.form.get('assetType')?.value;
    
    // Update available collaterals based on asset type
    if (assetType === 'Movable') {
      this.availableCollaterals = this.collateralMap.Movable;
    } else if (assetType === 'Immovable') {
      this.availableCollaterals = this.collateralMap.Immovable;
    } else {
      this.availableCollaterals = [];
    }

    // Reset collateral type when asset type changes
    this.form.patchValue({ collateralType: '', collateralTypeName: '' });
  }

  // When collateralType select changes, capture the selected option's display name
  onCollateralTypeChange(event?: Event) {
    const selectElement = event?.target as HTMLSelectElement | undefined;
    let selectedName = '';
    if (selectElement) {
      const selectedOption = selectElement.selectedOptions && selectElement.selectedOptions.length
        ? selectElement.selectedOptions[0]
        : undefined;
      // Read from data-name attribute set on the option
      selectedName = selectedOption?.getAttribute('data-name') || '';
    } else {
      // Fallback: try to infer from lists using selected id
      const selectedId = this.form.get('collateralType')?.value;
      const all = [
        ...(this.serialCollaterals || []),
        ...(this.generalCollaterals || []),
        ...(this.nonMovableCollaterals || []),
      ];
      const found = all.find((c: any) => c.collateralId === selectedId);
      selectedName = found?.collateral || '';
    }

    // Store human-readable name to drive template conditions
    this.form.patchValue({ collateralTypeName: selectedName });

    // Clear immovable-specific fields when switching types
    this.form.patchValue({
      thramNo: '',
      dzongkhag: '',
      gewog: '',
      plotId: '',
      buildingNo: '',
      flatNo: '',
    });
  }

  getMasterData(){
    const payload = {
      masterType: 'MANAGE_COLLATERAL_TYPE',
      // roleCode: 'admin',
      // agencyId: '1',
      page: 1,
      size: 300
    };
    this.api.getMasterData(payload).subscribe((response: any) => {
      console.log(response);
      this.collateralList = response.content;
      console.log(this.collateralList);
      // For Serial Collaterals (S)
      this.serialCollaterals = this.collateralList.filter((item) => item.identifierType === 'S').map((item) => ({
        collateralId: item.collateralId,
        collateral: item.collateralType
      }));

      // For General Collaterals (G)
      this.generalCollaterals = this.collateralList.filter((item) => item.identifierType === 'G').map((item) => ({
        collateralId: item.collateralId,
        collateral: item.collateralType
      }));

      // For General Collaterals (N)
      this.nonMovableCollaterals = this.collateralList.filter((item) => item.identifierType == 'N').map((item) => ({
        collateralId: item.collateralId,
        collateral: item.collateralType
      }));
    });
  }

  
}
