import { TrainingModule } from "../../domain/entities/TrainingApp";

export const modules: TrainingModule[] = [
    {
        id: "test",
        name: { key: "module-name", referenceValue: "3DBionotes", translations: {} },
        type: "core",
        contents: {
            welcome: { key: "module-welcome", referenceValue: "", translations: {} },
            steps: [
                {
                    title: {
                        key: "step-1-title",
                        referenceValue: "Welcome to 3DBionotes",
                        translations: {},
                    },
                    pages: [
                        {
                            key: "step-1-1",
                            translations: {},
                            referenceValue:
                                "![ezgif-7-0b118daf6981](https://user-images.githubusercontent.com/2181866/104316238-7658c700-54dc-11eb-858a-3d2b82ae490a.gif)\n\nLorem ipsum dolor sit amet consectetur adipiscing elit dapibus scelerisque leo, erat massa inceptos ridiculus malesuada quis phasellus at sodales. Est senectus dictum non rutrum ligula neque integer curae, diam montes himenaeos purus netus feugiat erat massa, tempus hac viverra leo dapibus lacinia velit. Rutrum convallis viverra torquent cursus eget aliquet dui et, dictum magnis auctor nullam facilisi suscipit gravida nec, nibh integer etiam ultricies vestibulum quisque porta.\n\nOrnare ac placerat duis lobortis porta penatibus mus, sociis vitae magna phasellus est vehicula dictumst, felis parturient malesuada turpis fames mi. Pellentesque arcu nulla condimentum tortor sem nostra felis, mi cursus ante laoreet pretium scelerisque sodales malesuada, odio torquent consequat augue eros sapien. Dui eleifend inceptos quis ornare viverra vivamus bibendum diam imperdiet interdum, convallis neque urna sociosqu scelerisque per platea vel nisl, ultricies potenti senectus odio non magna leo felis purus.",
                        },
                    ],
                },
                {
                    title: {
                        key: "step-2-title",
                        referenceValue: "Learn to use the viewer",
                        translations: {},
                    },
                    pages: [
                        {
                            key: "step-2-1",
                            translations: {},
                            referenceValue:
                                "The 3D viewer page consists of two main layouts:\n\n- The structure viewer located on the left side\n\n- The track viewer located on the right side",
                        },
                        {
                            key: "step-2-2",
                            translations: {},
                            referenceValue:
                                "## How to operate the structure viewer\n\nYou can zoom and rotate the viewer.\n\n![foo](https://user-images.githubusercontent.com/2181866/104316932-7d340980-54dd-11eb-8f65-6b70c3b3ff5e.gif)",
                        },
                        {
                            key: "step-2-3",
                            translations: {},
                            referenceValue:
                                "## How to operate the track viewer\n\n In the right side you can preview all the relevant information in multiple tracks and in sync with the 3D viewer.\n\n![image](https://user-images.githubusercontent.com/2181866/104317031-a3f24000-54dd-11eb-9ab8-3c49c9b1e5fc.png)",
                        },
                    ],
                },
                {
                    title: {
                        key: "step-3-title",
                        referenceValue: "PDBe › 7kj5",
                        translations: {},
                    },
                    pages: [
                        {
                            key: "step-3-1",
                            translations: {},
                            referenceValue:
                                "![image](https://user-images.githubusercontent.com/2181866/104318194-5b3b8680-54df-11eb-965d-2506859468ed.png)\n\n\n\n<object data='https://ftp.wwpdb.org/pub/pdb/validation_reports/kj/7kj5/7kj5_full_validation.pdf.gz' type='application/pdf' width='550px' height='550px'></object>",
                        },
                    ],
                },
                {
                    title: {
                        key: "step-3-title",
                        referenceValue: "Additional resources",
                        translations: {},
                    },
                    pages: [
                        {
                            key: "step-3-1",
                            translations: {},
                            referenceValue:
                                "You can watch the following video to learn more about the 3D viewer\n\n<iframe width='560' height='315' src='https://www.youtube.com/embed/dQn7iulGM60' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>",
                        },
                    ],
                },
            ],
        },
    },
];
