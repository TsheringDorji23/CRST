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
  isDisabled = true;     // ✔ boolean
  hasAgreedToDeclaration: boolean = false;
  
  // Add this property to track identifier type
  selectedCollateralIdentifierType: string = '';
  
  // Dropdown options
  assetTypes: string[] = ['Movable', 'Immovable'];
  debtorTypes: string[] = ['Individual', 'Institute'];
  purposes: any[] = []; // Will store purpose objects with id and name
  // explicit keys so template can access collateralMap.Movable / .Immovable
  collateralMap: { Movable: string[]; Immovable: string[] } = {
    Movable: ['Heavy Vehicles', 'Medium Vehicles', 'Light Vehicles', 'Two-Wheeler', 'Taxi'],
    Immovable: ['Land', 'Strata'],
  };

  // Available collateral options based on asset type
  availableCollaterals: string[] = [];
  collateralList: any[] = [];
  dzongkhagList :any[]= [];
  gewogList:any[]= [];
  getpurpos:any[]=[];
  
  debtorTypeOptions = [
    { value: 'ind', label: 'Individual' },
    { value: 'ins', label: 'Institute' },
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

  constructor(private fb: FormBuilder, private api: Api ) {  
    this.form = this.fb.group({
    // requesterCid: ['', [Validators.required]],
    // requestedBy: ['', [Validators.required]],
    // phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
    // email: ['', [Validators.required, Validators.email]],
    // currentAddress: ['', [Validators.required]],
    
  });}

  ngOnInit(): void {
    this.form = this.fb.group({
      assetType: ['', Validators.required],
      debtorType: ['',Validators.required],
      collateralType: ['',Validators.required],  // integer field
      collateralTypeName: [''], // for template conditions
      purpose: ['',Validators.required],         // integer field
      requestedBy: ['', Validators.required],
      requesterCid: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      currentAddress: ['',[Validators.required, Validators.minLength(10)]],
      remarks: [''],
      cidOrInstitutionNo: ['',Validators.required],
      vehicleNo: ['',Validators.required],
      identificationNo: [''],
      thramNo: [''],
      dzongkhag: [''],
      gewog: [''],
      plotIds: ['',Validators.required],
      buildingNumbers: ['',Validators.required],
      flatNumbers: ['',Validators.required],
      // plotIds: this.fb.control([]),          // array field
      // buildingNumbers: this.fb.control([]),  // array field
      // flatNumbers: this.fb.control([]),      // array field
      applicableFee: ['']
    });
  
  

    // 👇 Auto update applicable fee when debtor type changes
    this.form.get('debtorType')?.valueChanges.subscribe((debtorType) => {
      // Clear the CID/Institution number when debtor type changes
      this.form.patchValue({ cidOrInstitutionNo: '' });
      if (debtorType === 'ind') {
        this.form.patchValue({ applicableFee: 100 });
      } else if (debtorType === 'ins') {
        this.form.patchValue({ applicableFee: 200 });
      } else {
        this.form.patchValue({ applicableFee: '' });
      }
    });

    // 👇 Reset collateral type when asset type changes
    this.form.get('assetType')?.valueChanges.subscribe(() => {
      this.form.patchValue({ collateralType: '', collateralTypeName: '' });
      this.selectedCollateralIdentifierType = '';
      this.clearConditionalValidators();
    });
    
    this.getMasterData();
    this.getDzongkhag();
    this.getpurpose();
    // this.getPublicSearch();

    // Load gewogs when dzongkhag changes
    this.form.get('dzongkhag')?.valueChanges.subscribe((dzVal) => {
      // reset gewog on dzongkhag change
      this.form.patchValue({ gewog: '' });
      const dzId = this.extractDzongkhagId(dzVal);
      if (dzId) {
        this.getGewog(dzId);
      } else {
        this.gewogList = [];
      }
    });
  }

  onCancel() {
    this.showSearchOverlay = false;
    console.log('Search canceled. Modal is now hidden.');
    window.location.reload();
  }

  onSearch(): void {
    console.log('>>> onSearch triggered <<<');

    if (!this.form.valid) {
      console.log('Form invalid, marking all fields as touched');
      // this.form.markAllAsTouched();
      // return;
    }

    const formValue = this.form.value;
    console.log('Form value:', formValue);

    const payload = {
      ...formValue,
      collateralType: formValue.collateralType && formValue.collateralType !== '' ? Number(formValue.collateralType) : null,
      purpose: formValue.purpose && formValue.purpose !== '' ? Number(formValue.purpose) : null,
      requesterCid: formValue.requesterCid || '',
      email: formValue.email || '',
      phoneNumber: formValue.phoneNumber || '',
      currentAddress: formValue.currentAddress || '',
      vehicleNo: this.selectedCollateralIdentifierType === 'S' ? formValue.vehicleNo : null,
      identificationNo: this.selectedCollateralIdentifierType === 'G' ? formValue.identificationNo : null,
      identifierType: this.selectedCollateralIdentifierType,
      plotIds: Array.isArray(formValue.plotIds) ? formValue.plotIds : formValue.plotIds ? [formValue.plotIds] : [],
      buildingNumbers: Array.isArray(formValue.buildingNumbers) ? formValue.buildingNumbers : formValue.buildingNumbers ? [formValue.buildingNumbers] : [],
      flatNumbers: Array.isArray(formValue.flatNumbers) ? formValue.flatNumbers : formValue.flatNumbers ? [formValue.flatNumbers] : []
    };

    console.log('Submitting payload:', payload);

    try {
      this.api.getPublicSearch(payload).subscribe({
        next: (response: any) => {
          console.log('>>> HTTP success callback entered <<<');
          console.log('Search result:', response);

          if (!Array.isArray(response) || response.length === 0) {
            console.error('No search results returned');
            return;
          }

          const firstResult = response[0];
          console.log('First result:', firstResult);

          const paymentRequest = {
            reportNo: firstResult.reportNo,
            registrationNo: firstResult.registration_no,
            debtorType: formValue.debtorType || 'ind',       
            requesterCid: formValue.requesterCid || '',   
            currentAddress: formValue.currentAddress || '', 
            phoneNumber: formValue.phoneNumber || '',       
            serviceName: 'Public Search',
            requestedBy: formValue.requestedBy || 'System',
            email: formValue.email || ''
          };

          console.log('Payment request prepared:', paymentRequest);

          this.api.submitPayment(paymentRequest).subscribe({
            next: (html) => {
              console.log('>>> Payment submission callback entered <<<');
              document.open();
              document.write(html);
              document.close();
            },
            error: (err) => console.error('Payment submission failed:', err)
          });
        },
        error: (err) => {
          console.error('>>> HTTP error callback entered <<<');
          console.error('Search error:', err);
        }
      });
    } catch (e) {
      console.error('Exception while calling getPublicSearch:', e);
    }
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
    this.selectedCollateralIdentifierType = '';
    this.clearConditionalValidators();
  }

  // When collateralType select changes, capture the selected option's display name
  onCollateralTypeChange(event?: Event) {
    const selectElement = event?.target as HTMLSelectElement | undefined;
    let selectedName = '';
    let selectedCollateralId = '';
    
    if (selectElement) {
      const selectedOption = selectElement.selectedOptions && selectElement.selectedOptions.length
        ? selectElement.selectedOptions[0]
        : undefined;
      // Read from data-name attribute set on the option
      selectedName = selectedOption?.getAttribute('data-name') || '';
      selectedCollateralId = selectElement.value;
    } else {
      // Fallback: try to infer from lists using selected id
      selectedCollateralId = this.form.get('collateralType')?.value;
      const all = [
        ...(this.serialCollaterals || []),
        ...(this.generalCollaterals || []),
        ...(this.nonMovableCollaterals || []),
      ];
      const found = all.find((c: any) => c.collateralId === selectedCollateralId);
      selectedName = found?.collateral || '';
    }

    // Find the collateral to get identifierType
    const allCollaterals = [
      ...(this.serialCollaterals || []),
      ...(this.generalCollaterals || []),
      ...(this.nonMovableCollaterals || []),
    ];
    
    const foundCollateral = allCollaterals.find(
      (c: any) => c.collateralId.toString() === selectedCollateralId.toString()
    );
    
    // Store identifierType
    this.selectedCollateralIdentifierType = foundCollateral?.identifierType || '';

    // Store human-readable name to drive template conditions
    this.form.patchValue({ collateralTypeName: selectedName });

    // Apply conditional validators based on identifier type
    this.applyConditionalValidators();

    // Clear immovable-specific fields when switching types
    this.form.patchValue({
      thramNo: '',
      dzongkhag: '',
      gewog: '',
      plotId: '',
      buildingNo: '',
      flatNo: '',
      vehicleNo: '',
      identificationNo: ''
    });
  }

  // Helper method to apply conditional validators based on identifier type
  private applyConditionalValidators() {
    const vehicleNoControl = this.form.get('vehicleNo');
    const identificationNoControl = this.form.get('identificationNo');
    
    // Clear existing validators
    vehicleNoControl?.clearValidators();
    identificationNoControl?.clearValidators();
    
    // Add validators based on identifier type
    if (this.selectedCollateralIdentifierType === 'S') {
      vehicleNoControl?.setValidators([Validators.required]);
    } else if (this.selectedCollateralIdentifierType === 'G') {
      identificationNoControl?.setValidators([Validators.required]);
    }
    
    // Update the validity
    vehicleNoControl?.updateValueAndValidity();
    identificationNoControl?.updateValueAndValidity();
  }
  
  // Helper method to clear conditional validators
  private clearConditionalValidators() {
    const vehicleNoControl = this.form.get('vehicleNo');
    const identificationNoControl = this.form.get('identificationNo');
    
    vehicleNoControl?.clearValidators();
    identificationNoControl?.clearValidators();
    
    vehicleNoControl?.updateValueAndValidity();
    identificationNoControl?.updateValueAndValidity();
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
        collateral: item.collateralType,
        identifierType: item.identifierType  // Keep identifierType
      }));

      // For General Collaterals (G)
      this.generalCollaterals = this.collateralList.filter((item) => item.identifierType === 'G').map((item) => ({
        collateralId: item.collateralId,
        collateral: item.collateralType,
        identifierType: item.identifierType  // Keep identifierType
      }));

      // For General Collaterals (N)
      this.nonMovableCollaterals = this.collateralList.filter((item) => item.identifierType == 'N').map((item) => ({
        collateralId: item.collateralId,
        collateral: item.collateralType,
        identifierType: item.identifierType  // Keep identifierType
      }));
    });
  }
  
  getDzongkhag(){
    this.api.getDzongkhag().subscribe((response: any) => {
      console.log(response);
      this.dzongkhagList = Array.isArray(response) ? response : (response?.content ?? []);
    });
  }
  
  private extractDzongkhagId(dz: any): any {
    // Supports both object and primitive value in the control
    if (dz && typeof dz === 'object') {
      return dz.dzongkhagSerialNo ?? dz.id ?? dz.dzongkhagId ?? dz.code ?? '';
    }
    return dz ?? '';
  }
  
  getGewog(dzongkhagSerialNo: string){
    this.api.getGewog(dzongkhagSerialNo).subscribe((response: any) => {
      console.log(response);
      this.gewogList = Array.isArray(response) ? response : (response?.content ?? []);
    });
  }

  getpurpose(){
    this.api.getpurpose().subscribe((response: any) => {
      console.log(response);
      const list = Array.isArray(response) ? response : (response?.content ?? []);
      this.purposes = (list || [])
        .filter((p: any) => p && typeof p.searchPurpose === 'string' && p.searchPurpose.trim().length > 0)
        .map((p: any) => ({
          id: p.purposeId || p.id || p.searchPurposeId || p.purposeID,
          name: p.searchPurpose.trim()
        }));
    });
  }
}