const typeColors = [
'#ADBD21',
'#735A4A',
'#7B63E7',
'#FFC631',
'#EF70EF',
'#A55239',
'#F75231',
'#9CADF7',
'#6363B5',
'#7BCE52',
'#AE7A3B',
'#5ACEE7',
'#ADA594',
'#9141CB',
'#EF4179',
'#BDA55A',
'#81A6BE',
'#399CFF',
];
const fidThreshold = [
18,
328,
1154,
1163,
1173,
1174,
1176,
1182,
1183,
1218,
1633,
];
const fidToProc = [
[12,0,40,100,35,0,[],[4]],
[12,2,-1,100,40,0,[[-1,7,-1]],[14,21,6]],
[9,0,45,100,25,0,[],[4]],
[12,2,-1,-1,20,0,[],[]],
[9,2,-1,90,10,0,[],[55,6]],
[9,0,55,95,25,0,[],[0,7,21]],
[13,2,-1,75,35,0,[[-1,14,0]],[5,6]],
[9,2,-1,75,15,0,[[-1,16,0]],[5,6]],
[9,0,80,100,15,0,[],[10]],
[12,0,90,85,20,0,[],[4,53,33]],
[12,2,-1,100,20,0,[[-1,13,-2]],[21,6]],
[9,2,-1,-1,5,0,[],[13]],
[9,2,-1,100,10,0,[],[6]],
[9,0,120,85,10,0,[],[4]],
[9,1,120,100,10,0,[],[]],
[9,0,90,100,15,0,[],[16,22]],
[9,1,120,100,10,0,[],[4,38,9,20]],
[12,0,40,100,35,0,[],[4]],
[6,1,40,100,25,0,[[10,19,0]],[]],
[12,2,-1,100,20,0,[[-1,12,-1]],[6]],
[2,1,60,100,20,0,[[30,18,0]],[]],
[6,0,65,95,15,0,[[10,21,0],[10,19,0]],[4,12]],
[12,0,70,100,20,0,[],[4,0,7]],
[6,1,90,100,15,0,[[10,19,0]],[]],
[12,2,-1,100,10,0,[[-1,11,-2]],[6]],
[6,1,35,85,15,0,[],[45]],
[6,1,100,50,5,0,[[100,19,0]],[]],
[6,0,120,100,15,0,[[10,19,0]],[4,36,30,33]],
[7,1,75,95,15,0,[[30,21,0]],[7]],
[6,1,95,90,10,0,[[10,19,0]],[30,16,21]],
[2,0,80,100,15,0,[],[4]],
[12,2,-1,100,30,0,[[-1,8,-1]],[21,6]],
[17,1,40,100,25,0,[],[]],
[17,2,-1,-1,40,0,[[-1,1,1]],[]],
[12,0,50,100,40,0,[[100,4,1]],[4,44]],
[1,0,60,100,25,0,[[30,21,0]],[4,12]],
[17,1,60,100,20,0,[[20,20,0]],[11]],
[12,2,-1,-1,10,4,[],[]],
[17,2,-1,-1,5,0,[],[]],
[17,0,90,90,10,0,[],[4]],
[12,2,-1,-1,15,0,[[-1,0,2],[-1,2,2],[-1,4,2],[-1,1,-1],[-1,3,-1]],[]],
[16,2,-1,-1,15,0,[[-1,1,2]],[]],
[17,1,110,80,5,0,[],[]],
[17,0,120,100,10,0,[],[4,36,33]],
[16,1,80,100,10,0,[[10,10,-1]],[]],
[0,2,-1,95,40,0,[[-1,11,-2]],[21,6]],
[0,0,60,100,20,0,[],[4]],
[12,2,-1,-1,30,0,[[-1,1,1]],[]],
[7,1,40,100,35,0,[],[16]],
[12,2,-1,55,20,0,[[-1,20,0]],[14,6]],
[14,1,50,100,25,0,[[10,20,0]],[]],
[9,2,-1,75,30,0,[[-1,18,0]],[5,6]],
[14,1,65,100,20,0,[[10,20,0]],[]],
[12,2,-1,-1,20,-6,[],[18,19,16,6]],
[12,2,-1,-1,25,0,[],[]],
[0,1,90,100,10,0,[[10,10,-1]],[14]],
[7,2,-1,-1,15,0,[],[16]],
[0,2,-1,-1,20,2,[],[5]],
[0,2,-1,-1,20,0,[[-1,2,1],[-1,3,1],[-1,4,1]],[9]],
[13,0,15,100,35,0,[[30,14,0]],[]],
[0,0,25,100,20,0,[[20,14,0]],[23]],
[12,0,15,85,20,0,[],[4,26]],
[0,0,40,95,20,0,[],[4,7]],
[12,0,20,100,20,0,[],[4,51]],
[1,0,40,100,20,0,[],[4,51]],
[12,2,-1,-1,30,0,[],[2]],
[13,1,65,100,10,0,[],[]],
[1,0,60,100,10,0,[],[4]],
[13,2,-1,-1,20,0,[],[6]],
[0,0,25,95,20,0,[],[26]],
[13,0,80,100,20,0,[[30,14,0]],[4]],
[14,2,-1,-1,30,0,[[-1,4,2]],[]],
[12,0,-1,100,5,0,[],[4,49]],
[0,0,50,100,25,0,[],[4]],
[10,2,-1,100,15,0,[[-1,12,-1]],[6]],
[12,0,40,100,30,1,[],[4]],
[2,1,40,100,20,0,[[20,21,0]],[16,21]],
[7,2,-1,100,15,0,[[-1,7,-2]],[9,6]],
[7,0,60,100,35,0,[],[4]],
[7,2,-1,-1,5,0,[],[13]],
[7,0,60,-1,20,0,[],[4,7]],
[7,1,110,70,10,0,[[30,20,0]],[48,16]],
[12,2,-1,-1,30,0,[],[]],
[1,0,80,100,15,0,[[20,8,-1]],[4,12]],
[1,0,70,100,5,1,[],[4]],
[12,0,-1,90,10,0,[],[4]],
[12,0,120,100,15,0,[],[4,36,33]],
[12,2,-1,-1,20,0,[[-1,0,2]],[9]],
[7,0,35,100,35,0,[],[4]],
[12,2,-1,100,30,0,[[-1,8,-1]],[21,6]],
[7,0,80,100,20,0,[],[4]],
[7,0,60,100,20,0,[],[4]],
[10,0,80,95,10,0,[],[4,0]],
[12,0,15,90,20,0,[],[4,45]],
[12,2,-1,100,30,0,[[-1,18,0]],[6]],
[12,2,-1,85,40,0,[[-1,8,-2]],[14,6]],
[13,1,40,100,30,0,[[10,10,-1]],[21]],
[12,2,-1,-1,10,0,[],[13]],
[12,2,-1,-1,20,0,[],[]],
[12,1,-1,-1,10,0,[],[]],
[13,1,40,100,20,0,[[100,10,-2]],[10]],
[13,1,90,100,10,0,[[30,14,0]],[10]],
[13,2,-1,100,10,0,[],[6]],
[13,1,120,90,10,0,[],[]],
[11,2,-1,-1,30,0,[],[18]],
[13,2,-1,-1,20,0,[[-1,0,1],[-1,1,1],[-1,5,1]],[]],
[13,0,120,80,5,0,[[30,14,0]],[]],
[3,0,65,95,15,0,[[10,21,0],[10,18,0]],[4,12]],
[11,0,65,95,15,0,[[10,21,0],[10,17,0]],[4,12]],
[3,1,40,100,30,0,[[10,18,0]],[]],
[4,2,-1,75,10,0,[[-1,20,0]],[6]],
[4,2,-1,100,20,0,[[-1,7,-2]],[6]],
[1,2,-1,-1,20,0,[[-1,2,2]],[]],
[12,2,-1,-1,20,0,[[-1,7,-1]],[18,6]],
[3,0,20,100,20,0,[[100,18,0]],[4]],
[3,2,-1,90,20,0,[[-1,18,0]],[6]],
[12,2,-1,-1,15,0,[[-1,6,1]],[]],
[3,1,-1,100,10,0,[],[10]],
[12,0,30,100,10,2,[],[17]],
[3,0,65,100,20,0,[[30,18,0]],[4]],
[16,0,100,75,15,0,[[30,8,-1]],[4]],
[3,1,80,100,15,0,[[30,18,0]],[22]],
[3,1,90,100,15,0,[[10,18,0]],[]],
[14,2,-1,-1,30,0,[],[]],
[3,1,110,70,10,0,[[30,18,0]],[48]],
[3,1,-1,-1,20,0,[],[]],
[3,0,50,100,15,2,[],[4,1]],
[3,0,75,100,15,0,[[10,18,0]],[4,8]],
[12,2,-1,-1,40,0,[[-1,1,1]],[]],
[15,0,30,90,20,0,[],[4,51]],
[10,0,60,100,20,0,[[100,11,-1]],[22]],
[12,1,60,-1,20,0,[],[21]],
[12,0,18,80,15,0,[],[4,26]],
[10,0,80,100,10,0,[],[4]],
[16,0,-1,100,5,0,[],[4,10]],
[15,2,-1,-1,10,0,[],[]],
[10,0,100,100,10,0,[],[22]],
[12,0,75,95,10,0,[[50,8,-1]],[4]],
[10,0,35,85,15,0,[],[45]],
[5,0,30,100,30,0,[],[4,23]],
[12,2,-1,-1,20,5,[],[18]],
[13,2,-1,90,10,0,[[-1,15,0]],[6]],
[1,2,-1,100,15,0,[[-1,9,1],[-1,20,0]],[6]],
[10,1,90,100,10,0,[[10,10,-1]],[]],
[5,0,120,100,5,0,[[-1,0,-1],[-1,1,-1]],[4]],
[13,1,95,100,10,0,[[10,14,0]],[22]],
[12,0,65,100,25,0,[],[4]],
[0,0,120,85,10,0,[],[4]],
[12,0,40,100,35,0,[],[4]],
[12,2,-1,55,15,0,[[-1,16,0]],[14,6]],
[12,2,-1,-1,40,0,[],[]],
[12,2,-1,-1,20,0,[],[]],
[4,1,40,-1,15,0,[],[14,21]],
[12,2,-1,-1,15,3,[],[6]],
[14,1,20,100,10,0,[],[]],
[12,2,-1,100,5,0,[],[18,6]],
[12,2,-1,-1,15,0,[],[17,18]],
[17,2,-1,-1,10,0,[],[17]],
[12,2,-1,-1,10,0,[],[]],
[4,2,-1,-1,5,0,[],[13]],
[14,2,-1,-1,5,0,[],[17]],
[16,0,90,90,10,0,[[20,0,1]],[4,8]],
[12,2,-1,-1,20,2,[],[]],
[14,2,-1,-1,20,0,[[-1,1,1],[-1,3,1]],[]],
[4,1,95,100,15,0,[[30,9,-1]],[]],
[14,2,-1,-1,10,0,[],[13]],
[12,2,-1,100,20,0,[],[18,6]],
[8,2,-1,100,10,0,[],[18,6]],
[6,1,60,100,15,0,[],[21]],
[8,2,-1,100,10,0,[[-1,20,0]],[6]],
[6,2,-1,85,15,0,[[-1,19,0]],[6]],
[14,1,80,100,20,0,[[10,21,0]],[]],
[14,2,-1,100,10,0,[],[18]],
[6,1,110,85,5,0,[[10,19,0]],[]],
[12,1,40,100,15,0,[],[14]],
[12,0,60,100,25,0,[],[4]],
[12,1,60,100,15,0,[],[14]],
[14,2,-1,-1,5,0,[[-1,16,0]],[13]],
[12,0,85,100,15,0,[[30,18,0]],[4]],
[12,2,-1,-1,10,0,[],[18]],
[12,1,90,100,10,0,[],[14,21]],
[4,0,90,90,10,0,[[10,7,-1]],[4]],
[9,1,20,100,25,0,[],[42,13]],
[8,0,30,100,15,0,[[30,21,0]],[4]],
[12,2,-1,-1,5,0,[],[57,6]],
[13,0,50,100,15,0,[[50,15,0]],[4,12]],
[5,2,-1,-1,15,3,[],[]],
[7,1,60,95,25,0,[],[0,7,16,21]],
[0,0,80,100,10,0,[],[4,42,13]],
[9,1,40,100,15,0,[],[42,13]],
[9,1,75,100,10,0,[],[42,13]],
[9,2,-1,-1,10,0,[],[]],
[9,2,-1,-1,5,0,[],[]],
[9,2,-1,100,15,0,[[-1,16,0]],[5,6]],
[0,0,80,100,15,0,[],[4,7]],
[13,0,70,100,20,0,[[10,14,0]],[4,0,7]],
[14,0,80,90,15,0,[[20,21,0]],[4]],
[14,1,90,100,10,0,[[10,10,-1]],[]],
[0,1,60,100,5,0,[[10,22,1]],[16]],
[10,1,20,100,10,0,[[100,12,-1]],[]],
[10,0,200,30,5,0,[],[43]],
[12,1,80,100,10,0,[[20,24,0]],[]],
[1,0,70,100,15,0,[],[4,0,7]],
[10,2,-1,-1,10,0,[[-1,7,1],[-1,9,1]],[]],
[12,0,40,100,10,3,[[100,21,0]],[4]],
[12,0,40,100,20,0,[],[]],
[1,2,-1,100,20,0,[],[18,6]],
[15,1,80,100,20,0,[],[]],
[1,2,-1,100,10,0,[],[50]],
[17,2,-1,-1,15,0,[],[17]],
[17,2,-1,100,20,0,[],[6]],
[12,2,-1,-1,10,0,[],[18]],
[14,2,-1,-1,20,0,[[-1,3,2]],[]],
[14,2,-1,-1,10,0,[],[17,50]],
[17,0,40,100,20,1,[],[4]],
[12,2,-1,-1,20,0,[],[18,50]],
[5,0,-1,100,20,0,[],[4]],
[5,0,-1,100,20,0,[],[4]],
[12,2,-1,85,15,0,[[-1,7,2],[-1,20,0]],[6]],
[5,0,100,80,5,0,[],[4,0]],
[12,0,120,100,10,0,[],[4,38,20]],
[5,0,120,100,5,0,[[-1,1,-1],[-1,3,-1]],[4]],
[10,0,75,100,10,0,[],[4]],
[2,0,120,100,10,0,[],[4,38,20]],
[5,1,-1,100,5,0,[],[]],
[1,0,-1,100,10,0,[],[50]],
[8,0,50,100,10,0,[],[4,8]],
[12,2,-1,-1,40,0,[[-1,7,1]],[14]],
[6,0,60,100,25,0,[[10,19,0]],[4,30]],
[12,0,70,100,5,0,[],[4]],
[12,2,-1,-1,20,-6,[],[14,19,6]],
[5,0,-1,100,15,0,[],[4]],
[12,0,80,100,5,2,[],[4]],
[12,2,-1,-1,40,0,[],[18,6]],
[14,2,-1,60,20,0,[[-1,16,0]],[6]],
[10,1,55,95,15,0,[[100,11,-1]],[]],
[17,1,65,100,20,0,[[10,11,-1]],[]],
[12,2,-1,-1,10,0,[],[35,60]],
[5,0,100,50,5,0,[[100,20,0]],[4,8]],
[5,0,60,90,10,-6,[],[4,19]],
[14,2,-1,-1,20,-6,[],[52]],
[14,2,-1,80,15,0,[[-1,12,-1]],[6]],
[14,2,-1,-1,20,0,[],[]],
[14,2,-1,-1,15,2,[],[17,50]],
[14,0,70,100,20,0,[],[0,7]],
[12,2,-1,-1,5,0,[],[13]],
[14,1,80,100,10,0,[],[]],
[14,2,-1,-1,10,0,[],[18]],
[14,1,120,100,10,0,[],[51,17]],
[14,2,-1,-1,20,0,[[-1,2,1],[-1,3,1]],[]],
[5,0,60,100,10,-4,[],[4]],
[5,0,65,100,20,0,[[100,11,-1]],[4]],
[1,0,65,100,20,0,[],[4]],
[5,0,70,-1,10,-1,[],[4]],
[12,0,80,100,15,0,[],[4]],
[2,0,40,90,15,0,[],[4,23]],
[5,2,-1,-1,20,0,[[-1,0,1],[-1,1,1]],[]],
[5,0,50,100,25,0,[],[4,0]],
[15,2,-1,-1,10,3,[],[]],
[12,0,80,75,20,0,[],[4]],
[9,1,130,90,5,0,[[-1,2,-2]],[]],
[9,0,90,100,15,0,[],[4,0,7]],
[8,1,65,100,10,0,[],[]],
[13,2,-1,-1,20,0,[[-1,1,2]],[]],
[17,1,90,100,15,0,[],[22]],
[12,2,-1,-1,15,0,[],[18]],
[12,1,-1,100,5,0,[],[4]],
[15,2,-1,-1,20,0,[[-1,4,2]],[]],
[15,0,50,90,15,0,[],[]],
[15,0,50,100,15,0,[],[]],
[12,0,200,100,5,0,[],[15,22]],
[15,2,-1,-1,20,0,[],[6]],
[15,0,25,90,10,0,[],[26,10]],
[12,0,250,100,5,0,[],[15,22]],
[15,0,100,80,5,0,[],[0]],
[16,0,-1,100,10,0,[],[4]],
[6,0,50,100,20,0,[[100,4,1]],[4]],
[12,0,65,100,20,0,[[30,21,0]],[4]],
[16,0,70,-1,10,0,[],[4]],
[8,2,-1,-1,10,0,[],[18,17]],
[12,2,-1,-1,10,0,[],[6]],
[12,0,70,100,15,0,[[30,21,0]],[4]],
[12,2,-1,-1,5,0,[],[13]],
[14,2,-1,-1,10,0,[],[11,13,6]],
[3,2,-1,-1,10,0,[],[]],
[16,2,-1,85,40,0,[[-1,10,-2]],[14,6]],
[12,2,-1,-1,5,0,[],[]],
[3,1,120,50,5,0,[[100,18,0]],[10]],
[3,2,-1,-1,10,0,[],[]],
[12,0,50,95,30,0,[],[4,7]],
[12,0,40,100,40,0,[],[4]],
[7,0,120,100,15,0,[],[4,36,33]],
[12,0,35,90,10,0,[],[4,23]],
[12,1,90,100,10,0,[],[14,20,51,38]],
[12,2,-1,-1,30,0,[],[]],
[11,1,55,95,15,0,[[100,11,-1]],[16,21]],
[11,0,40,100,30,1,[],[]],
[17,2,-1,-1,20,0,[],[]],
[11,1,65,100,20,0,[[10,7,-1]],[]],
[17,1,65,100,10,0,[],[]],
[17,0,80,100,10,0,[],[4]],
[11,1,90,100,10,0,[[10,17,0]],[]],
[11,2,-1,-1,10,0,[],[]],
[11,1,200,20,5,0,[],[43]],
[0,1,75,100,15,0,[[10,20,0]],[]],
[13,2,-1,90,40,0,[[-1,14,0]],[21,6]],
[13,1,65,100,20,0,[[30,14,0]],[]],
[12,2,-1,-1,10,0,[[-1,6,2]],[]],
[1,2,-1,100,10,0,[[-1,7,-2],[-1,9,-2]],[]],
[17,1,35,85,15,0,[],[45]],
[17,0,75,95,10,0,[[50,8,-1]],[4,7]],
[11,0,25,100,30,0,[],[26]],
[10,2,-1,-1,20,0,[],[6]],
[11,0,85,90,10,0,[[30,21,0]],[]],
[8,0,30,100,30,0,[[30,18,0]],[4]],
[1,0,50,100,10,0,[],[4]],
[8,1,-1,100,15,0,[],[]],
[1,1,80,100,15,0,[[20,21,0]],[11]],
[8,1,80,100,15,0,[[20,10,-1]],[10]],
[8,2,-1,-1,5,0,[],[17]],
[14,1,100,100,15,0,[],[42,13]],
[8,0,60,-1,20,0,[],[4,8]],
[12,2,-1,-1,5,0,[],[17,14,49]],
[12,0,15,85,20,0,[],[4,45]],
[10,2,-1,-1,15,0,[],[17]],
[15,0,75,90,10,0,[[30,21,0]],[21]],
[8,2,-1,100,15,0,[],[]],
[16,0,50,95,35,0,[[10,0,1]],[4]],
[12,0,-1,100,15,0,[],[4]],
[17,0,100,90,10,0,[],[4,0]],
[12,0,200,30,5,0,[],[4,43]],
[5,0,100,90,10,0,[[-1,4,-1]],[4,8]],
[3,2,-1,-1,20,0,[[-1,3,1]],[]],
[3,2,-1,100,15,0,[[-1,9,-2]],[6]],
[3,1,50,90,10,0,[[70,2,1]],[]],
[14,1,-1,100,20,-5,[],[]],
[3,2,-1,-1,20,0,[[-1,8,1],[-1,10,1]],[18]],
[12,0,15,85,20,0,[],[26,10]],
[9,0,25,100,30,0,[],[26,10]],
[9,0,120,100,15,0,[],[4,36,33]],
[10,0,25,90,10,0,[],[26]],
[10,0,50,90,10,0,[],[23]],
[10,0,65,85,20,0,[[10,21,0]],[]],
[5,0,75,100,15,0,[],[4]],
[5,0,100,95,10,0,[],[4,33]],
[5,0,60,85,15,0,[[30,21,0]],[4]],
[5,0,40,100,30,1,[],[4,8]],
[12,2,-1,-1,10,4,[],[]],
[6,0,85,90,10,0,[[10,19,0]],[4,0]],
[12,0,120,75,5,0,[],[4]],
[5,0,130,90,10,0,[],[4,33]],
[5,0,120,90,10,0,[[30,20,0]],[4,33]],
[5,0,75,100,10,0,[],[4,42,8,13]],
[12,0,18,85,15,0,[],[4,26,8]],
[5,1,40,100,30,1,[],[]],
[5,2,-1,-1,5,4,[],[]],
[16,0,40,100,30,1,[],[4,8]],
[11,0,75,100,15,0,[[10,17,0]],[4,8]],
[6,0,75,100,15,0,[[10,19,0]],[4,8]],
[12,0,80,85,20,0,[],[4,8]],
[5,0,-1,100,20,-5,[],[4]],
[5,0,150,100,20,-3,[],[4,8]],
[13,1,30,70,20,0,[[40,14,0]],[]],
[13,1,50,-1,15,0,[],[]],
[12,0,200,30,5,0,[],[4,43]],
[12,2,-1,-1,5,0,[],[13]],
[12,0,140,100,5,0,[],[4]],
[12,0,10,100,35,0,[[10,11,-1]],[4]],
[15,1,60,100,5,0,[[10,22,1]],[]],
[12,2,-1,100,20,0,[[-1,7,-1],[-1,8,-1]],[6]],
[9,2,-1,-1,20,0,[],[]],
[2,1,85,100,10,0,[],[11]],
[2,2,-1,-1,20,0,[[-1,0,1],[-1,4,1]],[9]],
[17,0,80,100,15,0,[[20,21,0]],[4]],
[12,2,-1,-1,40,0,[],[52]],
[14,2,-1,-1,10,0,[],[18]],
[14,2,-1,-1,10,0,[],[18]],
[14,2,-1,-1,20,0,[[-1,1,2]],[]],
[12,2,-1,-1,10,0,[],[50]],
[4,1,80,100,10,0,[],[21]],
[12,2,-1,100,20,0,[[-1,20,0]],[9,22]],
[16,0,70,90,25,0,[[10,1,1]],[4]],
[11,1,40,100,25,0,[[10,17,0]],[21]],
[1,2,-1,100,20,0,[[-1,10,-2]],[6]],
[12,2,-1,75,10,0,[[-1,16,0]],[6]],
[11,1,110,70,5,0,[[10,17,0]],[16,21]],
[3,1,60,-1,20,0,[],[]],
[12,0,150,90,5,0,[],[4]],
[6,1,80,100,15,0,[[30,19,0]],[22]],
[6,2,-1,-1,5,0,[],[]],
[12,1,150,90,5,0,[],[]],
[12,0,55,100,30,0,[],[4]],
[5,0,60,100,10,0,[],[4,1]],
[5,0,80,80,20,0,[],[4,53,33]],
[12,2,-1,-1,30,0,[[-1,0,1],[-1,2,1]],[]],
[12,0,90,100,10,0,[],[4]],
[11,2,-1,-1,30,0,[],[]],
[12,2,-1,-1,10,0,[],[17]],
[4,2,-1,100,30,1,[[-1,7,-1]],[6]],
[12,0,-1,-1,20,0,[],[4]],
[17,1,60,100,20,0,[],[39,13]],
[17,1,90,85,10,0,[[30,12,-1]],[21]],
[3,1,60,100,20,0,[[100,18,0]],[]],
[6,0,60,100,20,0,[[100,19,0]],[4]],
[12,2,-1,-1,30,0,[],[]],
[12,2,-1,-1,30,0,[],[18,51]],
[14,2,-1,-1,15,4,[],[]],
[12,0,20,100,15,0,[],[26]],
[17,0,85,100,10,0,[[20,8,-1]],[4]],
[16,0,80,100,15,0,[[30,21,0]],[4]],
[12,2,-1,-1,5,0,[],[57,6]],
[12,1,50,100,15,0,[[30,21,0]],[14]],
[12,2,-1,-1,10,0,[],[]],
[10,0,95,95,10,0,[],[4]],
[11,1,70,100,20,0,[[10,17,0]],[]],
[6,1,130,90,5,0,[[-1,2,-2]],[30]],
[7,0,140,90,5,0,[[30,21,0]],[0]],
[2,0,60,90,10,-6,[],[4,19]],
[2,0,100,75,10,0,[[20,21,0]],[4]],
[5,1,80,-1,20,0,[],[11,10]],
[14,1,100,100,10,0,[],[]],
[9,1,60,-1,20,0,[],[]],
[6,1,150,100,5,0,[],[21]],
[7,2,-1,-1,15,0,[[-1,13,-1]],[44,6]],
[0,1,50,100,20,0,[[100,9,-1]],[21]],
[0,1,20,100,20,0,[],[4,45]],
[8,0,40,100,30,1,[],[4]],
[0,2,-1,-1,20,0,[],[6]],
[13,2,-1,100,20,0,[[-1,14,0],[-1,11,-1]],[6]],
[12,2,-1,-1,10,0,[],[13]],
[4,1,40,100,30,0,[],[16]],
[14,2,-1,100,10,0,[],[]],
[9,2,-1,100,40,0,[[-1,11,-2]],[5,21,6]],
[9,2,-1,-1,10,0,[[-1,1,3]],[]],
[3,2,-1,-1,25,1,[],[]],
[7,0,85,85,5,0,[[30,18,0]],[4]],
[15,0,60,95,15,0,[[100,11,-1]],[]],
[12,2,-1,-1,20,0,[[-1,7,-1],[-1,9,-1]],[6]],
[15,0,150,80,5,0,[],[4,37,33]],
[7,0,55,100,15,0,[],[4]],
[0,0,70,100,20,0,[],[4,52]],
[14,1,80,95,15,0,[],[]],
[12,2,-1,-1,5,0,[],[13]],
[1,1,80,95,15,0,[],[]],
[1,1,55,95,15,0,[[100,9,-1]],[14,21]],
[1,0,95,100,15,0,[],[4]],
[1,2,-1,100,15,0,[],[18,6]],
[1,2,-1,100,15,0,[],[]],
[11,2,-1,-1,10,0,[],[52]],
[14,1,-1,100,15,0,[],[]],
[12,2,-1,-1,20,0,[],[49]],
[12,1,60,100,15,0,[],[]],
[14,1,40,100,10,0,[],[23]],
[16,1,65,85,10,0,[[30,12,-1]],[]],
[12,0,100,100,5,0,[],[4,17]],
[13,0,50,100,25,0,[[10,14,0]],[4,0]],
[16,2,-1,-1,15,0,[[-1,4,2]],[]],
[12,0,-1,-1,10,1,[],[4,50]],
[14,2,-1,-1,10,0,[],[]],
[14,2,-1,-1,10,0,[],[]],
[14,2,-1,-1,10,0,[],[]],
[5,0,15,100,20,0,[],[4,26]],
[1,0,80,100,15,0,[],[4]],
[1,2,-1,-1,15,0,[[-1,0,1],[-1,5,1]],[]],
[1,0,-1,100,10,0,[],[26]],
[17,1,65,85,10,0,[[50,12,-1]],[10]],
[12,0,-1,90,15,0,[],[]],
[1,0,-1,100,10,0,[],[4]],
[14,0,70,90,10,0,[[100,1,1]],[4]],
[12,2,-1,-1,1,0,[],[18]],
[5,0,10,90,10,0,[],[4,24]],
[12,2,-1,-1,5,0,[],[14]],
[12,2,-1,-1,5,0,[],[13]],
[6,0,100,95,5,0,[[50,19,0]],[30]],
[12,1,50,100,10,0,[],[10]],
[7,1,100,95,5,0,[],[16,0]],
[14,2,-1,100,15,0,[],[21,6]],
[9,0,40,100,40,0,[],[]],
[9,1,90,100,10,0,[[10,10,-1]],[10]],
[12,2,-1,-1,10,0,[],[52]],
[5,0,40,100,15,0,[[50,8,-1]],[4]],
[1,0,60,100,25,0,[],[4]],
[12,2,-1,100,15,0,[],[18,6]],
[4,1,50,100,10,0,[],[4,40,13]],
[4,2,-1,-1,10,0,[],[]],
[6,1,75,100,10,0,[[100,9,-1]],[]],
[8,1,60,100,5,0,[[10,22,1]],[16]],
[5,0,60,100,10,0,[[30,18,0]],[4]],
[12,2,-1,-1,5,0,[],[]],
[8,0,70,100,15,0,[],[4,0]],
[8,2,-1,-1,5,0,[],[]],
[8,0,90,100,10,0,[],[4,17]],
[12,1,140,100,10,0,[],[14,22]],
[10,0,120,100,5,0,[[-1,1,-1],[-1,3,-1]],[4,8]],
[12,0,70,100,20,0,[],[4]],
[16,0,-1,100,10,0,[],[]],
[3,0,90,100,15,0,[],[4,53,33]],
[12,2,-1,100,15,0,[],[6]],
[12,2,-1,100,20,0,[[-1,12,-1]],[6]],
[0,2,-1,-1,20,0,[[-1,2,3]],[]],
[17,1,150,100,5,0,[],[21]],
[12,2,-1,100,30,0,[[-1,7,-1],[-1,9,-1]],[14,6]],
[12,0,70,100,10,0,[[20,20,0]],[4,8]],
[1,0,60,-1,20,0,[],[4]],
[1,0,20,100,10,0,[],[4]],
[9,2,-1,-1,10,4,[],[]],
[14,2,-1,-1,10,0,[],[17,50]],
[11,2,-1,-1,10,0,[],[]],
[12,2,-1,-1,10,0,[],[]],
[14,2,-1,100,10,0,[],[50]],
[14,1,120,100,10,0,[],[22]],
[11,1,60,90,10,0,[],[1]],
[11,0,30,90,20,0,[],[4,51,10]],
[17,0,35,85,15,0,[],[4,45]],
[7,0,90,95,15,0,[],[4]],
[7,0,40,90,10,0,[],[4,23]],
[14,1,95,100,5,0,[[50,9,-1]],[10]],
[14,1,95,100,5,0,[[50,10,-1]],[]],
[12,2,-1,100,15,0,[],[6]],
[17,1,110,85,10,0,[],[11,21]],
[10,0,120,85,10,0,[],[21]],
[7,0,120,100,5,0,[[-1,1,-1],[-1,3,-1]],[4]],
[16,1,140,100,5,0,[],[51,17]],
[14,2,-1,-1,10,0,[],[18]],
[14,1,140,90,5,0,[[-1,2,-2]],[]],
[6,0,120,100,10,0,[],[38,20]],
[12,0,80,90,15,0,[[10,21,0]],[4,12]],
[3,1,70,100,20,0,[],[52]],
[13,2,-1,100,20,0,[[-1,7,-1],[-1,9,-1],[-1,11,-1]],[21,6]],
[12,0,70,100,20,0,[],[4]],
[0,0,80,100,15,0,[[100,7,-1]],[4]],
[4,2,-1,-1,20,0,[[-1,10,1]],[18]],
[0,0,90,100,15,0,[],[0]],
[0,2,-1,-1,10,0,[[-1,1,1],[-1,3,1]],[]],
[0,2,-1,-1,5,0,[],[13]],
[4,2,-1,-1,10,0,[[-1,8,1]],[]],
[9,2,-1,100,10,0,[[-1,7,-1]],[41,13,6]],
[12,0,-1,100,20,0,[],[4]],
[12,0,-1,100,20,0,[],[4]],
[12,2,-1,-1,30,0,[],[]],
[7,1,65,100,20,0,[[100,20,0]],[14]],
[12,2,-1,-1,20,0,[[-1,9,-1]],[14,6]],
[7,2,-1,-1,20,0,[],[]],
[9,1,-1,100,20,0,[],[4]],
[9,1,65,90,10,0,[[50,12,-1]],[]],
[11,2,-1,-1,20,0,[],[]],
[1,2,-1,100,15,0,[],[6,50]],
[15,0,150,90,5,0,[],[10]],
[9,0,100,90,10,0,[],[55]],
[11,1,100,90,10,0,[],[]],
[14,2,-1,-1,5,-7,[],[17]],
[5,0,90,100,15,0,[],[4,7]],
[17,0,70,100,20,0,[],[0,7]],
[14,1,80,100,10,0,[],[21]],
[14,1,70,90,10,0,[[100,2,1]],[]],
[2,1,150,90,5,0,[],[]],
[2,1,100,95,5,0,[],[0]],
[6,1,100,75,5,0,[],[45]],
[12,2,-1,-1,40,0,[],[18,6]],
[5,0,80,100,10,0,[],[4]],
[12,0,-1,100,5,0,[],[4]],
[8,0,120,100,5,0,[],[4,17]],
[14,2,-1,-1,10,0,[],[9,13]],
[14,2,-1,-1,5,0,[],[28,13]],
[14,2,-1,-1,10,0,[[-1,2,1],[-1,3,1]],[27]],
[14,2,-1,-1,10,0,[],[18]],
[1,2,-1,80,10,0,[[-1,16,0]],[21,6]],
[12,0,-1,100,15,0,[],[50]],
[9,1,120,85,5,0,[[40,10,-2]],[]],
[1,0,-1,100,5,0,[],[4]],
[12,1,100,100,10,0,[],[]],
[6,0,180,95,5,0,[[-1,1,-1],[-1,3,-1],[-1,4,-1]],[4]],
[6,1,100,100,5,0,[[30,19,0]],[10,22]],
[6,0,-1,100,10,0,[],[4]],
[12,2,-1,-1,20,0,[],[]],
[6,1,70,100,15,0,[],[]],
[17,1,80,100,15,0,[[30,19,0]],[30,30]],
[14,2,-1,-1,10,0,[],[]],
[17,1,40,100,30,0,[[10,11,-1]],[21]],
[5,2,-1,-1,10,0,[],[]],
[9,2,-1,55,15,0,[[-1,16,0]],[14,6]],
[4,2,-1,-1,10,3,[],[]],
[1,1,85,95,10,0,[[40,12,-1]],[]],
[12,0,25,85,10,0,[],[4,26]],
[1,2,-1,-1,10,4,[],[50]],
[11,0,60,100,10,-4,[],[4]],
[12,2,-1,-1,20,0,[],[]],
[9,0,75,100,10,0,[],[4,42,13]],
[0,2,-1,-1,10,0,[],[57,6]],
[3,1,55,95,15,0,[[100,11,-1]],[21]],
[12,0,90,85,20,0,[[20,20,0]],[4]],
[16,0,50,85,15,0,[],[4,23]],
[16,2,-1,-1,10,0,[[-1,0,1],[-1,4,2]],[]],
[16,2,-1,-1,20,0,[[-1,7,1],[-1,9,1]],[18]],
[2,0,60,100,15,0,[[100,7,-1]],[4,21]],
[17,1,15,100,20,1,[],[26]],
[12,0,120,100,15,0,[],[4,53,33]],
[6,0,80,100,15,0,[[100,8,-1]],[4]],
[6,1,80,100,10,0,[[50,2,1]],[9]],
[7,1,100,80,10,0,[[30,11,-1]],[48,16,21]],
[3,1,100,80,10,0,[[20,18,0]],[48,16,21]],
[6,1,100,100,5,0,[],[30]],
[6,1,130,85,5,0,[[20,19,0]],[]],
[3,0,100,100,5,0,[],[]],
[3,0,130,85,5,0,[[20,18,0]],[4]],
[10,1,100,80,10,0,[[20,19,0]],[48,16,21]],
[11,1,65,95,10,0,[[100,11,-1]],[21]],
[5,1,85,100,10,0,[],[7]],
[12,1,75,100,10,0,[[10,16,0]],[14,21]],
[12,1,120,100,5,0,[],[]],
[9,0,60,100,15,0,[[30,21,0]],[4]],
[0,2,-1,100,20,1,[],[18,5,6]],
[1,2,-1,100,20,0,[[-1,7,-1],[-1,9,-1]],[52,14,6]],
[16,2,-1,-1,10,4,[],[]],
[1,2,-1,-1,20,0,[],[6]],
[12,0,130,100,10,0,[[-1,1,1]],[4]],
[3,1,65,100,20,0,[],[42,22,13]],
[3,2,-1,-1,20,0,[],[]],
[12,1,80,100,10,0,[],[0,16,21]],
[12,2,-1,-1,20,0,[],[]],
[4,1,120,85,5,0,[],[]],
[5,0,100,95,10,0,[],[4]],
[4,2,-1,-1,10,0,[],[18,17]],
[9,0,40,100,40,0,[],[4]],
[9,2,-1,100,20,0,[],[6]],
[8,2,-1,100,20,0,[],[6]],
[4,2,-1,-1,10,0,[[-1,2,2],[-1,3,2],[-1,4,2]],[]],
[7,1,80,100,10,0,[],[40,13]],
[5,1,120,70,5,0,[[10,10,-1]],[10]],
[10,0,90,100,10,0,[],[21]],
[10,0,90,100,10,0,[],[57,21]],
[2,1,100,100,10,0,[],[21]],
[10,0,90,100,10,0,[],[21]],
[15,0,100,95,5,0,[[50,1,2]],[21]],
[14,1,80,-1,5,0,[],[17,18]],
[17,1,110,95,5,0,[[30,19,0]],[30,30]],
[8,0,80,100,10,0,[],[57]],
[1,0,85,100,10,0,[],[4]],
[17,1,90,100,10,0,[],[32,14,22]],
[7,0,100,100,15,-3,[],[10]],
[11,0,100,90,10,0,[[-1,4,-1]],[4,8]],
[12,1,90,100,15,0,[],[9]],
[0,1,90,100,15,0,[],[10]],
[15,0,40,100,20,1,[],[4]],
[13,2,-1,-1,10,4,[],[]],
[9,0,125,100,10,0,[],[4,7]],
[12,2,-1,100,20,0,[[-1,9,-2]],[21,6]],
[1,0,60,100,20,0,[],[4,22]],
[9,0,70,100,15,0,[[100,7,-1]],[4]],
[4,2,-1,-1,10,0,[],[13,6]],
[14,2,-1,-1,15,0,[],[18]],
[0,0,90,100,10,2,[],[4]],
[10,2,-1,-1,5,0,[],[13]],
[13,2,-1,-1,20,0,[],[28,13,6]],
[12,0,120,100,10,0,[],[4]],
[6,1,150,100,5,-3,[],[21]],
[3,0,80,100,10,0,[[30,21,0]],[4]],
[14,0,85,100,10,0,[],[4,12]],
[16,0,80,100,20,0,[],[4,57]],
[5,0,85,90,15,0,[],[4,8]],
[2,1,110,100,5,0,[[-1,1,-1]],[14,21]],
[2,2,-1,100,5,0,[[-1,22,1]],[59,14,9]],
[4,1,-1,90,10,0,[],[]],
[16,0,100,100,5,0,[],[4,54]],
[5,0,70,100,10,0,[],[4,29]],
[8,1,100,100,5,0,[],[54]],
[5,0,40,100,20,0,[[100,0,1]],[4,8]],
[14,2,-1,-1,10,0,[],[18]],
[14,1,100,100,5,0,[],[54]],
[14,1,160,100,10,0,[],[]],
[4,1,130,90,5,0,[[-1,2,-2]],[]],
[8,0,90,100,10,0,[],[4,18]],
[6,1,150,100,5,0,[],[15,34,22]],
[3,0,100,100,15,0,[],[4,8]],
[16,0,60,100,5,0,[[30,21,0]],[4,23,8]],
[9,0,80,100,10,0,[[100,11,-1]],[]],
[6,0,120,90,5,0,[[10,19,0]],[30,10]],
[12,2,-1,100,10,0,[],[]],
[17,1,80,100,15,0,[],[0,47]],
[12,2,-1,-1,10,0,[[-1,1,2]],[]],
[1,0,80,100,10,0,[],[4,58,12]],
[15,2,-1,100,15,0,[[-1,11,-1]],[6]],
[9,0,80,100,10,0,[[100,8,-1]],[]],
[9,1,80,100,10,0,[[100,10,-1]],[]],
[3,1,80,100,10,0,[],[14,21]],
[6,1,130,100,5,0,[],[30]],
[5,2,-1,100,15,0,[[-1,8,-1],[-1,10,-1]],[57]],
[12,2,-1,-1,10,0,[],[]],
[14,2,-1,100,20,0,[],[5,6]],
[1,0,80,-1,10,0,[],[4]],
[4,0,75,100,15,0,[[100,9,-1]],[4]],
[1,2,-1,100,10,4,[],[]],
[5,0,150,100,5,0,[],[]],
[4,2,-1,-1,15,0,[[-1,7,2],[-1,9,2]],[17]],
[5,2,-1,-1,5,0,[[-1,22,1]],[56]],
[3,0,110,100,10,0,[[100,4,1]],[]],
[3,0,85,100,10,0,[],[4]],
[17,0,85,100,10,0,[],[4,12]],
[2,0,50,100,10,0,[],[23,51]],
[2,1,100,100,5,0,[],[]],
[1,0,75,100,5,0,[],[4,1,8]],
[9,2,-1,-1,10,0,[],[28]],
[3,1,80,90,15,0,[],[45]],
[2,1,150,100,5,0,[],[21]],
[15,0,65,90,15,0,[],[4,7]],
[13,0,80,100,15,0,[[50,23,0]],[4]],
[13,0,60,100,10,0,[[50,14,0]],[]],
[4,1,100,80,5,0,[[30,7,-1]],[16,21]],
[9,0,70,-1,10,0,[],[1]],
[6,1,80,100,10,0,[[100,2,1]],[14]],
[17,0,80,100,10,0,[[100,4,1]],[4,9]],
[0,0,70,90,10,0,[[100,9,-1]],[4]],
[0,2,-1,-1,10,4,[],[]],
[12,2,-1,-1,1,0,[],[13]],
[3,0,120,100,5,0,[],[4]],
[12,0,20,90,10,0,[],[4,25,7]],
[12,2,-1,-1,10,0,[[-1,0,1],[-1,4,1]],[44]],
[12,1,50,100,10,0,[],[11]],
[15,0,40,100,15,0,[],[]],
[6,1,120,100,5,0,[[-1,1,-1],[-1,3,-1]],[]],
[6,0,90,100,10,0,[],[4,42,7,13]],
[12,2,-1,100,10,0,[],[]],
[9,2,-1,-1,15,0,[[-1,7,2],[-1,8,-2]],[]],
[14,1,80,100,10,0,[[100,10,-2]],[]],
[16,0,160,100,5,0,[],[]],
[17,0,30,95,10,0,[],[4,24]],
[17,0,60,100,20,0,[],[4,52]],
[17,0,60,100,15,1,[],[4,8]],
[16,0,100,100,5,0,[[-1,4,-2]],[4]],
[13,0,30,100,15,0,[[100,14,0]],[4,44,21]],
[8,0,50,100,10,0,[],[]],
[11,0,80,100,15,0,[],[4]],
[12,2,-1,-1,10,0,[[-1,0,2],[-1,2,2],[-1,4,2]],[35]],
[2,0,80,100,10,0,[],[]],
[1,0,85,-1,10,0,[],[4,7]],
[16,0,130,100,5,0,[],[4]],
[2,0,120,100,5,0,[],[4]],
[16,1,120,100,5,0,[[-1,2,-1]],[21]],
[1,1,-1,90,10,0,[],[]],
[2,0,25,90,20,0,[[-1,4,1],[-1,1,-1]],[26]],
[5,0,100,100,5,0,[],[4]],
[3,1,100,100,5,0,[],[4]],
[17,1,80,100,15,0,[],[]],
[14,0,80,100,15,0,[],[4,7]],
[2,2,-1,-1,15,0,[],[]],
[9,1,60,85,10,0,[],[10]],
[9,1,80,90,15,0,[[20,19,0]],[42,30,30,21,13]],
[9,0,100,100,10,0,[],[0]],
[3,1,130,100,10,0,[[100,2,1]],[]],
[2,1,80,100,5,0,[],[46]],
[6,2,-1,-1,10,4,[],[]],
[3,1,70,100,5,1,[],[]],
[2,0,90,100,15,0,[],[4]],
[3,1,70,100,20,0,[],[]],
[15,0,95,100,5,0,[],[4,7,17]],
[16,1,50,-1,10,0,[],[23,7]],
[12,1,120,100,5,0,[],[21,51]],
[13,1,100,100,5,0,[[50,15,0]],[]],
[8,0,85,100,10,0,[[20,8,-1]],[]],
[4,1,140,90,5,0,[],[37,33]],
[13,1,90,100,10,0,[[20,14,0]],[51]],
[4,1,90,95,10,0,[[20,20,0]],[]],
[14,1,90,100,10,0,[[10,17,0]],[]],
[5,0,90,100,10,0,[[100,8,-1]],[4]],
[1,1,90,100,10,0,[[20,21,0]],[21]],
[14,1,80,100,5,0,[],[14]],
[9,0,35,100,15,0,[],[4,45]],
[9,1,150,95,5,0,[],[34]],
[8,1,60,100,15,0,[[30,19,0]],[]],
[1,0,65,90,15,0,[],[4,7]],
[5,2,-1,-1,10,0,[[-1,0,1],[-1,1,1],[-1,4,1]],[9]],
[8,1,75,100,10,0,[[100,7,-1]],[]],
[14,1,80,100,10,0,[[100,4,1]],[0]],
[16,2,-1,-1,10,0,[[-1,1,2]],[]],
[11,0,100,85,10,0,[[30,21,0]],[]],
[5,0,90,100,10,0,[[50,8,-1],[30,21,0]],[0]],
[12,1,140,100,5,0,[],[]],
[13,0,100,100,10,0,[[30,14,0]],[]],
[7,0,90,95,15,0,[[30,21,0]],[4]],
[11,0,20,90,10,0,[],[4,24]],
[14,0,60,100,25,0,[[30,21,0]],[4]],
[17,0,25,100,5,0,[],[4,24,1,8]],
[5,0,100,100,10,0,[[30,18,0]],[]],
[3,0,120,100,15,0,[[10,18,0]],[4,36,33]],
[17,1,90,100,15,0,[[30,18,0]],[21]],
[4,0,100,100,10,0,[[30,20,0]],[]],
[9,0,50,100,20,0,[[100,4,1]],[4]],
[11,0,120,100,5,0,[],[21]],
[3,0,100,95,15,0,[],[4,33]],
[1,0,80,100,10,0,[[10,16,0]],[]],
[8,1,120,100,5,0,[],[21]],
[10,1,70,100,10,0,[[30,19,0]],[30,30]],
[6,0,80,100,10,0,[[30,19,0]],[]],
[4,1,80,100,10,0,[],[14]],
[16,0,100,100,5,0,[],[4]],
[16,0,100,100,5,0,[],[4,7]],
[14,1,75,100,10,0,[],[14]],
[9,0,55,100,20,0,[],[4]],
[16,1,140,95,5,0,[],[34]],
[12,2,-1,-1,30,0,[],[]],
[12,0,70,100,20,0,[],[]],
[6,1,150,90,5,0,[],[]],
[17,1,150,90,5,0,[],[]],
[9,1,150,90,5,0,[],[]],
[2,1,130,90,5,0,[[-1,2,-2]],[]],
[7,0,60,100,10,0,[],[4,51]],
[17,1,80,100,10,0,[],[47]],
[6,1,80,100,10,0,[],[47]],
[9,1,80,100,10,0,[],[47]],
[15,1,120,90,10,0,[[-1,2,1]],[]],
[4,1,100,100,5,0,[],[22,15]],
[6,1,70,100,5,0,[],[21]],
[1,0,75,100,5,0,[],[4]],
[8,0,110,90,5,0,[],[]],
[13,2,-1,100,40,0,[],[22,6,50]],
[5,2,-1,-1,10,0,[[-1,7,1],[-1,8,1]],[]],
[12,1,80,100,10,0,[[-1,25,-1]],[]],
[0,0,50,100,20,0,[[100,11,-1]],[4]],
[17,1,50,100,20,0,[[100,7,-1]],[]],
[16,0,-1,100,10,0,[],[4]],
[6,0,75,100,10,0,[],[4]],
[5,0,65,100,15,3,[[100,21,0]],[4]],
[11,0,140,90,5,0,[[30,18,0]],[]],
[11,1,140,90,5,0,[[30,19,0]],[]],
[1,0,100,-1,5,0,[[-1,1,-1]],[18,17]],
[2,1,160,90,5,0,[],[]],
];
